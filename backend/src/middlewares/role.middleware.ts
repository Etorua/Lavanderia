import { Request, Response, NextFunction } from 'express';
import { UserRole } from './auth.middleware';

/**
 * Middleware para validar que el rol del usuario autenticado
 * pertenezca a los roles permitidos para el endpoint.
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Acceso no autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Acceso restringido. Tu rol (${req.user.role}) no tiene permisos para realizar esta acción.`,
        required_roles: allowedRoles,
      });
      return;
    }

    next();
  };
};
