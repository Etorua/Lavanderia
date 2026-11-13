import { Router } from 'express';
import { saveStandbyTicket, listStandbyTickets, deleteStandbyTicket } from '../controllers/standby.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('CAJERO', 'VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN'), saveStandbyTicket);
router.get('/', authorizeRoles('CAJERO', 'VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN'), listStandbyTickets);
router.delete('/:id', authorizeRoles('CAJERO', 'VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN'), deleteStandbyTicket);

export default router;

