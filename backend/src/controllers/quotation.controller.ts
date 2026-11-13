import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Creación de Cotización (Vendedor / Asesor)
 * Soporta opción de reserva temporal de stock por 48 horas.
 */
export const createQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { client_name, client_contact, items, reserves_stock, branch_id } = req.body;

    if (!client_name || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Nombre del cliente y al menos un producto son requeridos.' });
      return;
    }

    const targetBranchId = branch_id || user.branch_id;
    const count = await prisma.quotation.count();
    const folio = `COT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let total = 0;
    const formattedItems: Array<{ product_id: string; quantity: number; unit_price: number; subtotal: number }> = [];

    // Validar productos y calcular total
    for (const item of items) {
      const prod = await prisma.product.findUnique({ where: { id: item.product_id } });
      if (!prod) {
        res.status(404).json({ error: `Producto con ID "${item.product_id}" no encontrado.` });
        return;
      }

      const qty = Number(item.quantity);
      const unitPrice = item.unit_price ? Number(item.unit_price) : Number(prod.price);
      const subtotal = qty * unitPrice;
      total += subtotal;

      // Si se solicita reserva temporal, validar disponibilidad física real
      if (reserves_stock) {
        const availableStock = prod.stock - prod.reserved_stock;
        if (availableStock < qty) {
          res.status(400).json({
            error: `Inventario insuficiente para apartar el producto "${prod.name}". Stock disponible: ${availableStock}, solicitado: ${qty}.`,
          });
          return;
        }
      }

      formattedItems.push({
        product_id: prod.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // Reserva por 48 horas

    // Transacción: crear cotización y apartar stock si aplica
    const quotation = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          folio,
          branch_id: targetBranchId,
          user_id: user.id,
          client_name,
          client_contact,
          total,
          status: reserves_stock ? 'RESERVADA' : 'PENDIENTE',
          reserves_stock: Boolean(reserves_stock),
          reservation_expires_at: reserves_stock ? expiresAt : null,
          items: {
            create: formattedItems,
          },
        },
        include: {
          items: { include: { product: true } },
          user: { select: { full_name: true, role: true } },
        },
      });

      if (reserves_stock) {
        for (const item of formattedItems) {
          await tx.product.update({
            where: { id: item.product_id },
            data: {
              reserved_stock: { increment: item.quantity },
            },
          });
        }
      }

      return q;
    });

    res.status(201).json({
      message: `Cotización ${folio} generada con éxito.${reserves_stock ? ' Stock apartado temporalmente por 48 horas.' : ''}`,
      quotation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la cotización.', details: error });
  }
};

/**
 * Búsqueda express de cotización mediante su número de folio
 * Usada por el Cajero/Vendedor para recuperar la cotización aceptada.
 */
export const getQuotationByFolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folio } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { folio },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                stock: true,
                reserved_stock: true,
                image_url: true,
              },
            },
          },
        },
        user: { select: { full_name: true, email: true } },
        branch: { select: { name: true, code: true } },
      },
    });

    if (!quotation) {
      res.status(404).json({ error: `No se encontró ninguna cotización con el folio "${folio}".` });
      return;
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar cotización por folio.', details: error });
  }
};

/**
 * Liberación manual anticipada de la reserva temporal
 */
export const releaseQuotationReservation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!quotation) {
      res.status(404).json({ error: 'Cotización no encontrada.' });
      return;
    }

    if (quotation.status !== 'RESERVADA') {
      res.status(400).json({ error: `La cotización no tiene reserva activa (estado: ${quotation.status}).` });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Liberar stock reservado en cada producto
      for (const item of quotation.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            reserved_stock: { decrement: item.quantity },
          },
        });
      }

      await tx.quotation.update({
        where: { id },
        data: {
          status: 'CANCELADA',
          reserves_stock: false,
        },
      });
    });

    res.json({ message: `Reserva del folio ${quotation.folio} liberada. El material volvió a estar disponible.` });
  } catch (error) {
    res.status(500).json({ error: 'Error al liberar la reserva de cotización.', details: error });
  }
};

/**
 * Listado de Cotizaciones con filtros
 */
export const listQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { folio: { contains: search, mode: 'insensitive' } },
        { client_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { full_name: true, role: true } },
        sale: { select: { invoice_number: true, created_at: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar cotizaciones.', details: error });
  }
};

