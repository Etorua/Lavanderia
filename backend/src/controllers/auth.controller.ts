import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Debes proporcionar email y contraseña.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            is_locked: true,
            lock_reason: true,
            min_consumption: true,
            current_month_sales: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            is_locked: true,
            lock_reason: true,
          },
        },
      },
    });

    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Credenciales inválidas o cuenta dada de baja.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // Verificar si tiene un corte de caja abierto hoy (si es cajero)
    let activeCashCut = null;
    if (user.branch_id && user.role === 'CAJERO') {
      activeCashCut = await prisma.cashCut.findFirst({
        where: {
          branch_id: user.branch_id,
          user_id: user.id,
          status: 'ABIERTO',
        },
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_pos_system_2026_xyz';
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });

    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_locked: user.is_locked,
        lock_reason: user.lock_reason,
        branch: user.branch,
        business: user.business,
        activeCashCut: activeCashCut ? { id: activeCashCut.id, opened_at: activeCashCut.opened_at, initial_cash: activeCashCut.initial_cash } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al procesar inicio de sesión.', details: error });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        branch: true,
        business: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    const { password_hash, ...safeUserData } = user;
    res.json(safeUserData);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar perfil.' });
  }
};

export const createManagedUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const creator = req.user!;
    const { email, password, full_name, role, branch_id } = req.body;

    if (!email || !password || !full_name || !role) {
      res.status(400).json({ error: 'Todos los campos son requeridos (email, password, full_name, role).' });
      return;
    }

    // Validación jerárquica de creación de roles:
    // 1. ADMIN_SUCURSAL solo puede crear empleados locales de su tienda (CAJERO, VENDEDOR, ALMACENISTA_SUCURSAL)
    if (creator.role === 'ADMIN_SUCURSAL') {
      const allowedLocalRoles = ['CAJERO', 'VENDEDOR', 'ALMACENISTA_SUCURSAL'];
      if (!allowedLocalRoles.includes(role)) {
        res.status(403).json({ error: `Como Gerente de Sucursal solo puedes dar de alta personal de tienda (${allowedLocalRoles.join(', ')}).` });
        return;
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'Ya existe una cuenta con este correo electrónico.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password_hash,
        full_name,
        role,
        business_id: creator.business_id,
        branch_id: creator.role === 'ADMIN_SUCURSAL' ? creator.branch_id : branch_id,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        branch_id: true,
        business_id: true,
        is_active: true,
        created_at: true,
      },
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente.',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar de alta el usuario.', details: error });
  }
};
