import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Venta Directa de Mostrador (Walk-in / POS Express)
 */
export const createDirectSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { items, payment_method, amount_paid, customer_name, branch_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'La venta debe contener al menos un producto.' });
      return;
    }

    const targetBranchId = branch_id || user.branch_id;
    if (!targetBranchId) {
      res.status(400).json({ error: 'No se identificó el punto de venta donde se realiza el cobro.' });
      return;
    }

    // Validar que exista un corte de caja abierto hoy en esta sucursal
    const activeCashCut = await prisma.cashCut.findFirst({
      where: {
        branch_id: targetBranchId,
        status: 'ABIERTO',
      },
    });

    if (!activeCashCut) {
      res.status(400).json({
        error: 'No se puede procesar la venta: La caja no ha sido abierta hoy. Realiza la apertura de caja primero.',
      });
      return;
    }

    const count = await prisma.sale.count();
    const invoice_number = `VTA-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    let total = 0;
    const saleItemsData: Array<{ product_id: string; quantity: number; unit_price: number; subtotal: number }> = [];

    // Validar productos y calcular totales
    for (const item of items) {
      const prod = await prisma.product.findUnique({ where: { id: item.product_id } });
      if (!prod) {
        res.status(404).json({ error: `Producto no encontrado (ID: ${item.product_id}).` });
        return;
      }

      const qty = Number(item.quantity);
      const available = prod.stock - prod.reserved_stock;
      if (available < qty) {
        res.status(400).json({
          error: `Stock insuficiente para "${prod.name}". Stock disponible: ${available}, solicitado: ${qty}.`,
        });
        return;
      }

      const unitPrice = Number(prod.price);
      const subtotal = qty * unitPrice;
      total += subtotal;

      saleItemsData.push({
        product_id: prod.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      });
    }

    const paid = amount_paid ? Number(amount_paid) : total;
    if (paid < total) {
      res.status(400).json({ error: `El monto pagado ($${paid}) es menor al total de la venta ($${total}).` });
      return;
    }
    const changeGiven = paid - total;

    // Transacción atómica de Venta
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro Sale
      const newSale = await tx.sale.create({
        data: {
          invoice_number,
          branch_id: targetBranchId,
          user_id: user.id,
          cash_cut_id: activeCashCut.id,
          customer_name: customer_name || 'Público General',
          total,
          payment_method: payment_method || 'EFECTIVO',
          amount_paid: paid,
          change_given: changeGiven,
          items: {
            create: saleItemsData,
          },
        },
        include: { items: { include: { product: true } } },
      });

      // 2. Descontar stock y registrar en Kardex
      for (const item of saleItemsData) {
        const p = await tx.product.findUnique({ where: { id: item.product_id } });
        if (!p) continue;

        const prev = p.stock;
        const current = prev - item.quantity;

        await tx.product.update({
          where: { id: p.id },
          data: {
            stock: current,
            last_sale_at: new Date(),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            product_id: p.id,
            type: 'SALIDA_VENTA',
            quantity: item.quantity,
            previous_stock: prev,
            current_stock: current,
            reference_doc: invoice_number,
            reason: 'Venta directa en mostrador',
            user_id: user.id,
          },
        });
      }

      // 3. Acumular venta en el Corte de Caja del día
      const paymentField = payment_method === 'TARJETA' ? 'card_sales' : payment_method === 'TRANSFERENCIA' ? 'transfer_sales' : 'cash_sales';
      await tx.cashCut.update({
        where: { id: activeCashCut.id },
        data: {
          [paymentField]: { increment: total },
          total_sales: { increment: total },
          expected_cash: payment_method === 'EFECTIVO' ? { increment: total } : undefined,
        },
      });

      // 4. Acumular venta mensual de la sucursal (para el candado comercial)
      await tx.branch.update({
        where: { id: targetBranchId },
        data: {
          current_month_sales: { increment: total },
        },
      });

      return newSale;
    });

    res.status(201).json({
      message: `Venta ${invoice_number} procesada con éxito. Inventario y corte de caja actualizados.`,
      sale,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la venta directa.', details: error });
  }
};

/**
 * Conversión de Cotización Aceptada a Venta Directa
 * Utiliza el folio que el cliente aceptó (ej. COT-2026-0042)
 */
export const convertQuotationToSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { quotation_folio, payment_method, amount_paid, branch_id } = req.body;

    if (!quotation_folio) {
      res.status(400).json({ error: 'Debes ingresar el folio de la cotización a convertir.' });
      return;
    }

    const quotation = await prisma.quotation.findUnique({
      where: { folio: quotation_folio },
      include: { items: true },
    });

    if (!quotation) {
      res.status(404).json({ error: `No existe ninguna cotización con el folio "${quotation_folio}".` });
      return;
    }

    if (quotation.status === 'CONVERTIDA') {
      res.status(400).json({ error: `La cotización ${quotation_folio} ya fue convertida previamente a venta.` });
      return;
    }

    if (quotation.status === 'CANCELADA') {
      res.status(400).json({ error: `La cotización ${quotation_folio} está cancelada.` });
      return;
    }

    const targetBranchId = branch_id || quotation.branch_id || user.branch_id;
    const activeCashCut = await prisma.cashCut.findFirst({
      where: {
        branch_id: targetBranchId!,
        status: 'ABIERTO',
      },
    });

    if (!activeCashCut) {
      res.status(400).json({ error: 'No hay una caja abierta en esta sucursal para procesar el cobro.' });
      return;
    }

    const count = await prisma.sale.count();
    const invoice_number = `VTA-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const total = Number(quotation.total);
    const paid = amount_paid ? Number(amount_paid) : total;
    const changeGiven = Math.max(0, paid - total);

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Crear Venta enlazada a la cotización
      const newSale = await tx.sale.create({
        data: {
          invoice_number,
          branch_id: targetBranchId,
          user_id: user.id,
          cash_cut_id: activeCashCut.id,
          quotation_id: quotation.id,
          customer_name: quotation.client_name,
          total,
          payment_method: payment_method || 'EFECTIVO',
          amount_paid: paid,
          change_given: changeGiven,
          items: {
            create: quotation.items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // 2. Liberar reserva si existía y descontar stock físico en Kardex
      for (const item of quotation.items) {
        const p = await tx.product.findUnique({ where: { id: item.product_id } });
        if (!p) continue;

        const prev = p.stock;
        const current = prev - item.quantity;
        const newReserved = quotation.reserves_stock ? Math.max(0, p.reserved_stock - item.quantity) : p.reserved_stock;

        await tx.product.update({
          where: { id: p.id },
          data: {
            stock: current,
            reserved_stock: newReserved,
            last_sale_at: new Date(),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            product_id: p.id,
            type: 'SALIDA_VENTA',
            quantity: item.quantity,
            previous_stock: prev,
            current_stock: current,
            reference_doc: `${invoice_number} (Ref: ${quotation.folio})`,
            reason: `Venta por cotización ${quotation.folio} al cliente ${quotation.client_name}`,
            user_id: user.id,
          },
        });
      }

      // 3. Actualizar estado de la Cotización
      await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: 'CONVERTIDA',
          reserves_stock: false,
        },
      });

      // 4. Actualizar el Corte de Caja del día
      const paymentField = payment_method === 'TARJETA' ? 'card_sales' : payment_method === 'TRANSFERENCIA' ? 'transfer_sales' : 'cash_sales';
      await tx.cashCut.update({
        where: { id: activeCashCut.id },
        data: {
          [paymentField]: { increment: total },
          total_sales: { increment: total },
          expected_cash: payment_method === 'EFECTIVO' ? { increment: total } : undefined,
        },
      });

      // 5. Acumular venta mensual de sucursal
      if (targetBranchId) {
        await tx.branch.update({
          where: { id: targetBranchId },
          data: { current_month_sales: { increment: total } },
        });
      }

      return newSale;
    });

    res.status(201).json({
      message: `Cotización ${quotation.folio} convertida exitosamente a la venta ${invoice_number}.`,
      sale,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al convertir la cotización a venta.', details: error });
  }
};

/**
 * Listado histórico de ventas
 */
export const listSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branch_id, date } = req.query;
    const where: any = {};

    if (branch_id && typeof branch_id === 'string') {
      where.branch_id = branch_id;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { full_name: true, role: true } },
        quotation: { select: { folio: true } },
        branch: { select: { name: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar historial de ventas.', details: error });
  }
};

