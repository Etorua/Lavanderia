import { Router } from 'express';
import {
  openCashCut,
  getCurrentCashCut,
  closeCashCut,
  auditCashCut,
  createBranchExpense,
} from '../controllers/cashcut.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

// Operaciones de Caja
router.post('/open', authorizeRoles('CAJERO', 'ADMIN_SUCURSAL', 'SUPERADMIN'), openCashCut);
router.get('/current', authorizeRoles('CAJERO', 'ADMIN_SUCURSAL', 'FINANZAS_SUCURSAL', 'CONTABILIDAD_CORP', 'SUPERADMIN'), getCurrentCashCut);
router.post('/close/:id', authorizeRoles('CAJERO', 'ADMIN_SUCURSAL', 'SUPERADMIN'), closeCashCut);

// Auditoría por Finanzas de Sucursal o Contabilidad Corporativa
router.post('/audit/:id', authorizeRoles('FINANZAS_SUCURSAL', 'CONTABILIDAD_CORP', 'SUPERADMIN'), auditCashCut);

// Gastos menores (Caja chica)
router.post('/expenses', authorizeRoles('FINANZAS_SUCURSAL', 'ADMIN_SUCURSAL', 'SUPERADMIN'), createBranchExpense);

export default router;

