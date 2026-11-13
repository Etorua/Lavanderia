import { Router } from 'express';
import { updateProductPricing, getPriceHistory } from '../controllers/pricing.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

// Exclusivo de Contabilidad Corporativa y SuperAdmin
router.patch(
  '/products/:id',
  authorizeRoles('SUPERADMIN', 'CONTABILIDAD_CORP'),
  updateProductPricing
);

// Consulta de historial de precios
router.get(
  '/products/:id/history',
  authorizeRoles('SUPERADMIN', 'CONTABILIDAD_CORP', 'COMPRADOR_CORP', 'CLIENTE_ADMIN', 'ADMIN_SUCURSAL'),
  getPriceHistory
);

export default router;

