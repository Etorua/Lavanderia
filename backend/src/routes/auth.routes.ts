import { Router } from 'express';
import { login, getProfile, createManagedUser } from '../controllers/auth.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', login);

// Rutas protegidas
router.get('/me', authenticateJWT, getProfile);
router.post(
  '/users',
  authenticateJWT,
  authorizeRoles('SUPERADMIN', 'CLIENTE_ADMIN', 'ADMIN_SUCURSAL'),
  createManagedUser
);

export default router;

