import { Router } from 'express';
import { listBranches, createBranch, toggleLockBranch } from '../controllers/branch.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles('SUPERADMIN', 'CLIENTE_ADMIN', 'CONTABILIDAD_CORP', 'COMPRADOR_CORP', 'ADMIN_SUCURSAL'),
  listBranches
);

router.post(
  '/',
  authorizeRoles('SUPERADMIN', 'CLIENTE_ADMIN'),
  createBranch
);

// Activación / Desactivación del Candado Comercial por consumo o mora
router.patch(
  '/:id/lock',
  authorizeRoles('SUPERADMIN', 'CLIENTE_ADMIN'),
  toggleLockBranch
);

export default router;

