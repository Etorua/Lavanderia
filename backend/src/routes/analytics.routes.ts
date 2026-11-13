import { Router } from 'express';
import {
  getReorderSuggestions,
  getTopRotation,
  getDeadStock,
  getCommercialLockStatus,
} from '../controllers/analytics.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

// Sugerencias de compra predictiva (ROP)
router.get(
  '/reorder-suggestions',
  authorizeRoles('COMPRADOR_CORP', 'ALMACENISTA_CENTRAL', 'CONTABILIDAD_CORP', 'ADMIN_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  getReorderSuggestions
);

// Top de productos de alta rotación (Fast-Moving)
router.get(
  '/rotation/top',
  authorizeRoles('VENDEDOR', 'ADMIN_SUCURSAL', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  getTopRotation
);

// Detección de productos sin movimiento (Dead Stock)
router.get(
  '/rotation/dead-stock',
  authorizeRoles('COMPRADOR_CORP', 'CONTABILIDAD_CORP', 'ADMIN_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  getDeadStock
);

// Reporte de cuotas de consumo y riesgo de candado comercial
router.get(
  '/commercial-lock-status',
  authorizeRoles('CLIENTE_ADMIN', 'ADMIN_SUCURSAL', 'CONTABILIDAD_CORP', 'SUPERADMIN'),
  getCommercialLockStatus
);

export default router;

