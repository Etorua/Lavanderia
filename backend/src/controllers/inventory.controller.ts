import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Consulta de Kardex Histórico por Producto
 */
export const getProductKardex = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sku: true, qr_code: true, name: true, stock: true, reserved_stock: true, in_transit_stock: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    const movements = await prisma.inventoryMovement.findMany({
      where: { product_id: productId },
      include: {
        user: { select: { id: true, full_name: true, role: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      product,
      kardex: movements,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el Kardex del producto.', details: error });
  }
};

/**
 * Registro de Merma, Daño o Ajuste Físico en Tienda
 */
export const adjustStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { product_id, quantity, type, reason } = req.body;

    if (!product_id || !quantity || !type || !reason) {
      res.status(400).json({ error: 'Producto, cantidad, tipo de ajuste y motivo justificado son obligatorios.' });
      return;
    }

    const prod = await prisma.product.findUnique({ where: { id: product_id } });
    if (!prod) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    const qty = Number(quantity);
    const prev = prod.stock;
    let next = prev;

    if (type === 'SALIDA_MERMA' || type === 'SALIDA_AJUSTE' || type === 'SALIDA_TRASPASO') {
      if (prev < qty) {
        res.status(400).json({ error: `No hay suficiente stock físico para descontar (${prev} disponibles).` });
        return;
      }
      next = prev - qty;
    } else if (type === 'ENTRADA_AJUSTE' || type === 'ENTRADA_TRASPASO') {
      next = prev + qty;
    } else {
      res.status(400).json({ error: `Tipo de ajuste no reconocido: ${type}` });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: prod.id },
        data: { stock: next },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          product_id: prod.id,
          type,
          quantity: qty,
          previous_stock: prev,
          current_stock: next,
          reason,
          user_id: user.id,
        },
      });

      return { updatedProduct, movement };
    });

    res.status(201).json({
      message: `Ajuste de inventario (${type}) aplicado con éxito al producto "${prod.name}".`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al aplicar el ajuste de inventario.', details: error });
  }
};

