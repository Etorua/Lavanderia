import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const listBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let whereClause = {};

    if (user.role === 'CLIENTE_ADMIN') {
      whereClause = { business_id: user.business_id };
    }

    const branches = await prisma.branch.findMany({
      where: whereClause,
      include: {
        business: {
          select: { id: true, name: true, is_locked: true },
        },
        users: {
          select: { id: true, full_name: true, email: true, role: true, is_locked: true },
        },
        _count: {
          select: { sales: true, standbyTickets: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar puntos de venta.', details: error });
  }
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { name, code, address, phone, min_consumption } = req.body;

    if (!name || !code) {
      res.status(400).json({ error: 'Nombre y código de punto de venta son obligatorios.' });
      return;
    }

    const existing = await prisma.branch.findUnique({ where: { code } });
    if (existing) {
      res.status(409).json({ error: 'Ya existe un punto de venta con ese código único.' });
      return;
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        code,
        address,
        phone,
        min_consumption: min_consumption ? Number(min_consumption) : 0,
        business_id: user.role === 'CLIENTE_ADMIN' ? user.business_id : req.body.business_id,
      },
      include: {
        business: true,
      },
    });

    res.status(201).json({
      message: 'Punto de venta registrado exitosamente.',
      branch,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el punto de venta.', details: error });
  }
};

/**
 * Activa o desactiva el candado comercial de un punto de venta.
 * Puede ser invocado por el SUPERADMIN o por el CLIENTE_ADMIN (dueño del punto de venta).
 */
export const toggleLockBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { is_locked, lock_reason } = req.body;

    // Verificar permisos sobre la sucursal
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      res.status(404).json({ error: 'Punto de venta no encontrado.' });
      return;
    }

    if (user.role === 'CLIENTE_ADMIN' && branch.business_id !== user.business_id) {
      res.status(403).json({ error: 'No tienes permisos para modificar este punto de venta.' });
      return;
    }

    const updated = await prisma.branch.update({
      where: { id },
      data: {
        is_locked: Boolean(is_locked),
        lock_reason: is_locked ? (lock_reason || 'Bloqueado por falta de consumo mínimo o mora.') : null,
      },
    });

    res.json({
      message: updated.is_locked
        ? `Candado comercial ACTIVADO para el punto de venta "${updated.name}". Operaciones bloqueadas.`
        : `Candado comercial DESACTIVADO para el punto de venta "${updated.name}". Operaciones restauradas.`,
      branch: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el candado del punto de venta.', details: error });
  }
};

