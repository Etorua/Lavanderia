import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

/**
 * Motor de Pronósticos y Sugerencias de Reabastecimiento
 * Utiliza ROP, Lead Time, Consumo Promedio Diario y Stock de Seguridad.
 */
export const getReorderSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await prisma.product.findMany({
      where: { is_active: true },
    });

    const suggestions = [];

    for (const prod of products) {
      // 1. Calcular salidas reales en los últimos 30 días
      const movements = await prisma.inventoryMovement.findMany({
        where: {
          product_id: prod.id,
          type: 'SALIDA_VENTA',
          created_at: { gte: thirtyDaysAgo },
        },
      });

      const totalSales30d = movements.reduce((acc, m) => acc + m.quantity, 0);
      const cpd = totalSales30d > 0 ? totalSales30d / 30 : 0.1; // Consumo Promedio Diario

      // 2. Calcular Punto de Reorden (ROP): (CPD * lead_time) + safety_stock
      const rop = Math.ceil(cpd * prod.lead_time_days) + prod.safety_stock;

      // 3. Posición neta de inventario: (Stock físico - Reservado) + En tránsito
      const netPosition = prod.stock - prod.reserved_stock + prod.in_transit_stock;

      // 4. Determinar si requiere compra
      const needsReorder = netPosition <= rop;
      const suggestedQuantity = needsReorder ? Math.max(0, prod.max_stock - netPosition) : 0;

      if (needsReorder) {
        suggestions.push({
          product_id: prod.id,
          sku: prod.sku,
          name: prod.name,
          category: prod.category,
          stock_fisico: prod.stock,
          stock_reservado: prod.reserved_stock,
          stock_transito: prod.in_transit_stock,
          posicion_neta: netPosition,
          consumo_diario_estimado: Number(cpd.toFixed(2)),
          lead_time_dias: prod.lead_time_days,
          stock_seguridad: prod.safety_stock,
          punto_reorden_rop: rop,
          stock_maximo: prod.max_stock,
          cantidad_sugerida_comprar: suggestedQuantity,
          urgencia: netPosition <= prod.safety_stock ? 'CRÍTICA' : 'PREVENTIVA',
        });
      }
    }

    res.json({
      total_productos_en_alerta: suggestions.length,
      sugerencias: suggestions.sort((a, b) => (a.urgencia === 'CRÍTICA' ? -1 : 1)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar pronóstico de reabastecimiento.', details: error });
  }
};

/**
 * Top de Mayor Rotación (Fast-Moving Products) en los últimos 30 días
 */
export const getTopRotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await prisma.inventoryMovement.groupBy({
      by: ['product_id'],
      where: {
        type: 'SALIDA_VENTA',
        created_at: { gte: thirtyDaysAgo },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const populated = await Promise.all(
      movements.map(async (m) => {
        const prod = await prisma.product.findUnique({
          where: { id: m.product_id },
          select: { id: true, sku: true, name: true, price: true, stock: true, category: true, image_url: true },
        });

        const totalSold = m._sum.quantity || 0;
        const cpd = totalSold / 30;
        const daysOfInventory = prod && cpd > 0 ? Math.floor(prod.stock / cpd) : 999;

        return {
          ...prod,
          total_vendido_30d: totalSold,
          dias_inventario_restante: daysOfInventory,
        };
      })
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar productos de alta rotación.', details: error });
  }
};

/**
 * Detección de Productos Sin Movimiento (Dead Stock / Slow-Moving)
 * Existencia física pero 0 salidas en más de 30 o 60 días.
 */
export const getDeadStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const deadStockProducts = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        is_active: true,
        OR: [
          { last_sale_at: null },
          { last_sale_at: { lt: sixtyDaysAgo } },
        ],
      },
      select: {
        id: true,
        sku: true,
        name: true,
        category: true,
        price: true,
        cost: true,
        stock: true,
        last_sale_at: true,
      },
      orderBy: { stock: 'desc' },
    });

    const analysis = deadStockProducts.map((p) => {
      const capitalEstancado = Number(p.cost) * p.stock;
      const daysWithoutSales = p.last_sale_at
        ? Math.floor((new Date().getTime() - new Date(p.last_sale_at).getTime()) / (1000 * 3600 * 24))
        : 'Sin historial de ventas';

      return {
        ...p,
        capital_estancado: capitalEstancado,
        dias_sin_venta: daysWithoutSales,
        recomendacion: 'Evaluar descuento promocional, venta en combo o liquidación para liberar capital.',
      };
    });

    res.json({
      total_productos_sin_movimiento: analysis.length,
      capital_total_estancado: analysis.reduce((acc, p) => acc + p.capital_estancado, 0),
      productos: analysis,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al identificar productos sin movimiento.', details: error });
  }
};

/**
 * Reporte de Cuotas de Consumo y Candados Comerciales por Sucursal
 */
export const getCommercialLockStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        min_consumption: true,
        current_month_sales: true,
        is_locked: true,
        lock_reason: true,
      },
    });

    const report = branches.map((b) => {
      const min = Number(b.min_consumption);
      const current = Number(b.current_month_sales);
      const percentage = min > 0 ? Math.min(100, Math.round((current / min) * 100)) : 100;
      const isAtRisk = !b.is_locked && min > 0 && percentage < 50;

      return {
        ...b,
        porcentaje_meta: `${percentage}%`,
        alerta_candado: b.is_locked ? 'BLOQUEADA' : isAtRisk ? 'EN RIESGO DE BLOQUEO' : 'OPERACIÓN NORMAL',
      };
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar estatus de candados comerciales.', details: error });
  }
};

