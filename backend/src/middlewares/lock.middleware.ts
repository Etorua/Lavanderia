import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

/**
 * Middleware de Candado Comercial
 * Bloquea transacciones de venta, cotización y pedidos si la sucursal o la empresa
 * tienen activo el candado por falta de consumo mínimo o mora.
 */
export const checkCommercialLock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'No autenticado.' });
    return;
  }

  // Superadministradores y Contabilidad Corporativa nunca están bloqueados para auditar
  if (user.role === 'SUPERADMIN' || user.role === 'CONTABILIDAD_CORP') {
    next();
    return;
  }

  // 1. Candado individual de usuario
  if (user.is_locked) {
    res.status(403).json({
      error: 'Candado de Usuario Activo: Tu cuenta se encuentra temporalmente suspendida.',
      reason: user.lock_reason || 'Consulte con la administración.',
      locked_entity: 'USER',
    });
    return;
  }

  // 2. Candado a nivel de la Empresa (Dueño)
  if (user.business_id) {
    const business = await prisma.business.findUnique({
      where: { id: user.business_id },
      select: { is_locked: true, lock_reason: true, name: true },
    });

    if (business?.is_locked) {
      res.status(403).json({
        error: `Candado Comercial Corporativo: La empresa "${business.name}" está suspendida.`,
        reason: business.lock_reason || 'Mora o incumplimiento de cuota de consumo general.',
        locked_entity: 'BUSINESS',
      });
      return;
    }
  }

  // 3. Candado específico del Punto de Venta / Sucursal
  if (user.branch_id) {
    const branch = await prisma.branch.findUnique({
      where: { id: user.branch_id },
      select: {
        is_locked: true,
        lock_reason: true,
        name: true,
        min_consumption: true,
        current_month_sales: true,
      },
    });

    if (branch?.is_locked) {
      res.status(403).json({
        error: `Candado Comercial de Sucursal: La terminal "${branch.name}" se encuentra pausada.`,
        reason: branch.lock_reason || 'Consumo mensual por debajo de la cuota mínima pactada.',
        min_consumption: branch.min_consumption,
        current_month_sales: branch.current_month_sales,
        locked_entity: 'BRANCH',
      });
      return;
    }
  }

  next();
};
