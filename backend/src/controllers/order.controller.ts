import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const createCustomerOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { items, shipping_address, notes, branch_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'El pedido debe contener al menos un producto.' });
      return;
    }

    const count = await prisma.order.count();
    const order_number = `PED-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const prod = await prisma.product.findUnique({ where: { id: item.product_id } });
      if (!prod) {
        res.status(404).json({ error: `Producto no encontrado: ${item.product_id}` });
        return;
      }
      const qty = Number(item.quantity);
      const unitPrice = Number(prod.price);
      const subtotal = qty * unitPrice;
      total += subtotal;

      orderItems.push({
        product_id: prod.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      });
    }

    const order = await prisma.order.create({
      data: {
        order_number,
        user_id: user.id,
        branch_id,
        total,
        shipping_address,
        notes,
        status: 'PENDIENTE',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    res.status(201).json({
      message: `Pedido ${order_number} registrado con éxito.`,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar pedido.', details: error });
  }
};

export const listCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const where: any = {};

    // Si es cliente final, solo ve sus propios pedidos
    if (user.role === 'CLIENTE_FINAL') {
      where.user_id = user.id;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { full_name: true, email: true } },
        branch: { select: { name: true, code: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar pedidos.', details: error });
  }
};

