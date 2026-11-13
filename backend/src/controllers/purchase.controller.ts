import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Módulo del Comprador (Abastecimiento)
 * Genera una Orden de Compra y suma al stock en tránsito de cada producto.
 */
export const createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { supplier_name, supplier_contact, branch_id, items, expected_delivery_date, notes } = req.body;

    if (!supplier_name || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Proveedor y al menos un ítem son obligatorios.' });
      return;
    }

    const count = await prisma.purchaseOrder.count();
    const po_number = `OC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let total = 0;
    const itemsData = items.map((item: any) => {
      const subtotal = Number(item.quantity_ordered) * Number(item.unit_cost);
      total += subtotal;
      return {
        product_id: item.product_id,
        quantity_ordered: Number(item.quantity_ordered),
        unit_cost: Number(item.unit_cost),
        subtotal,
      };
    });

    // Transacción: Crear PO e incrementar in_transit_stock en los productos
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          po_number,
          supplier_name,
          supplier_contact,
          branch_id: branch_id || user.branch_id,
          user_id: user.id,
          status: 'EMITIDA',
          total,
          expected_delivery_date: expected_delivery_date ? new Date(expected_delivery_date) : null,
          notes,
          items: {
            create: itemsData,
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Incrementar stock en tránsito para cada producto
      for (const item of itemsData) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            in_transit_stock: { increment: item.quantity_ordered },
          },
        });
      }

      return po;
    });

    res.status(201).json({
      message: `Orden de Compra ${po_number} generada con éxito. Stock en tránsito actualizado.`,
      purchaseOrder,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la orden de compra.', details: error });
  }
};

export const listPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const pos = await prisma.purchaseOrder.findMany({
      where,
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        branch: { select: { id: true, name: true, code: true } },
        items: { include: { product: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar órdenes de compra.', details: error });
  }
};

/**
 * Módulo del Almacenista:
 * Recepciona físicamente la Orden de Compra, ingresa al Kardex y suma al stock real.
 */
export const receivePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) {
      res.status(404).json({ error: 'Orden de compra no encontrada.' });
      return;
    }

    if (po.status === 'RECIBIDA_TOTAL' || po.status === 'CANCELADA') {
      res.status(400).json({ error: `La orden de compra ya está en estado ${po.status}.` });
      return;
    }

    // Ejecutar recepción transaccional en el almacén
    await prisma.$transaction(async (tx) => {
      for (const item of po.items) {
        const prod = await tx.product.findUnique({ where: { id: item.product_id } });
        if (!prod) continue;

        const previous_stock = prod.stock;
        const current_stock = previous_stock + item.quantity_ordered;
        const newInTransit = Math.max(0, prod.in_transit_stock - item.quantity_ordered);

        // 1. Actualizar producto: stock físico aumenta, in_transit disminuye
        await tx.product.update({
          where: { id: prod.id },
          data: {
            stock: current_stock,
            in_transit_stock: newInTransit,
          },
        });

        // 2. Registrar en Kardex de inventario
        await tx.inventoryMovement.create({
          data: {
            product_id: prod.id,
            type: 'ENTRADA_COMPRA',
            quantity: item.quantity_ordered,
            previous_stock,
            current_stock,
            reference_doc: po.po_number,
            reason: `Recepción de Orden de Compra proveedor: ${po.supplier_name}`,
            user_id: user.id,
          },
        });

        // 3. Marcar cantidad recibida en el item
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { quantity_received: item.quantity_ordered },
        });
      }

      // 4. Actualizar estado de la Orden de Compra
      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'RECIBIDA_TOTAL',
          received_at: new Date(),
        },
      });
    });

    res.json({
      message: `Mercancía de la Orden ${po.po_number} recepcionada correctamente en almacén y registrada en el Kardex.`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al recepcionar la orden de compra.', details: error });
  }
};

