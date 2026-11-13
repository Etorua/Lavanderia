import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Modificación de Precios y Costos de Productos
 * Exclusivo de Contabilidad Corporativa y SuperAdmin.
 */
export const updateProductPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { price, cost, reason } = req.body;

    if (price === undefined && cost === undefined) {
      res.status(400).json({ error: 'Debes proporcionar al menos un nuevo precio o costo.' });
      return;
    }

    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    const newPrice = price !== undefined ? Number(price) : Number(currentProduct.price);
    const newCost = cost !== undefined ? Number(cost) : Number(currentProduct.cost);

    // Transacción: actualiza producto y registra en PriceHistory
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          price: newPrice,
          cost: newCost,
        },
      });

      const history = await tx.priceHistory.create({
        data: {
          product_id: id,
          old_price: currentProduct.price,
          new_price: newPrice,
          old_cost: currentProduct.cost,
          new_cost: newCost,
          changed_by_id: user.id,
          reason: reason || 'Ajuste de precio autorizado por contabilidad',
        },
      });

      return { updatedProduct, history };
    });

    res.json({
      message: `Precios del producto "${result.updatedProduct.name}" actualizados con éxito y registrados en la auditoría contable.`,
      product: result.updatedProduct,
      auditRecord: result.history,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar precios del producto.', details: error });
  }
};

/**
 * Consulta la auditoría de precios de un producto
 */
export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const history = await prisma.priceHistory.findMany({
      where: { product_id: id },
      include: {
        changedBy: {
          select: { id: true, full_name: true, email: true, role: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar el historial de precios.', details: error });
  }
};

