import { Router } from 'express';
import { getProductKardex, adjustStock } from '../controllers/inventory.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

// Consulta de Kardex Histórico
router.get(
  '/kardex/:productId',
  authorizeRoles(
    'ALMACENISTA_CENTRAL',
    'ALMACENISTA_SUCURSAL',
    'COMPRADOR_CORP',
    'CONTABILIDAD_CORP',
    'ADMIN_SUCURSAL',
    'CLIENTE_ADMIN',
    'SUPERADMIN'
  ),
  getProductKardex
);

// Ajustes físicos de inventario y mermas
router.post(
  '/adjust',
  authorizeRoles('ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'ADMIN_SUCURSAL', 'SUPERADMIN'),
  adjustStock
);

export default router;

