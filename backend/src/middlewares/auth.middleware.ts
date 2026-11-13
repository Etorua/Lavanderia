import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export type UserRole =
  | 'SUPERADMIN'
  | 'CLIENTE_ADMIN'
  | 'CONTABILIDAD_CORP'
  | 'COMPRADOR_CORP'
  | 'ALMACENISTA_CENTRAL'
  | 'ADMIN_SUCURSAL'
  | 'FINANZAS_SUCURSAL'
  | 'CAJERO'
  | 'VENDEDOR'
  | 'ALMACENISTA_SUCURSAL'
  | 'CLIENTE_FINAL';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  business_id?: string | null;
  branch_id?: string | null;
  is_locked: boolean;
  lock_reason?: string | null;
  branch?: {
    id: string;
    name: string;
    code: string;
    is_locked: boolean;
    lock_reason?: string | null;
  } | null;
  business?: {
    id: string;
    name: string;
    is_locked: boolean;
    lock_reason?: string | null;
  } | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Se requiere un token Bearer válido.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_pos_system_2026_xyz';

  try {
    const decoded = jwt.verify(token, secret) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            is_locked: true,
            lock_reason: true,
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
      res.status(401).json({ error: 'Usuario no encontrado o dado de baja.' });
      return;
    }

    req.user = user as unknown as AuthenticatedUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
    return;
  }
};
