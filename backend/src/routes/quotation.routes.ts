import { Router } from 'express';
import {
  createQuotation,
  getQuotationByFolio,
  releaseQuotationReservation,
  listQuotations,
} from '../controllers/quotation.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { checkCommercialLock } from '../middlewares/lock.middleware';

const router = Router();

router.use(authenticateJWT);

// Listado general de cotizaciones
router.get('/', listQuotations);

// Búsqueda por folio de cotización
router.get('/by-folio/:folio', getQuotationByFolio);

// Crear cotización (Sujeto a candado comercial)
router.post(
  '/',
  checkCommercialLock,
  authorizeRoles('VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN'),
  createQuotation
);

// Liberación de reserva
router.post(
  '/release/:id',
  authorizeRoles('VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN'),
  releaseQuotationReservation
);

export default router;

