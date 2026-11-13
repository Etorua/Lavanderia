import { Router } from 'express';
import { createDirectSale, convertQuotationToSale, listSales } from '../controllers/sale.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { checkCommercialLock } from '../middlewares/lock.middleware';

const router = Router();

router.use(authenticateJWT);

// Venta directa en mostrador (Sujeta a candado comercial)
router.post(
  '/direct',
  checkCommercialLock,
  authorizeRoles('CAJERO', 'ADMIN_SUCURSAL', 'SUPERADMIN'),
  createDirectSale
);

// Conversión de cotización aceptada a venta por número de folio (Sujeta a candado comercial)
router.post(
  '/convert-quotation',
  checkCommercialLock,
  authorizeRoles('CAJERO', 'ADMIN_SUCURSAL', 'SUPERADMIN'),
  convertQuotationToSale
);

// Historial de ventas
router.get(
  '/',
  authorizeRoles('CAJERO', 'FINANZAS_SUCURSAL', 'ADMIN_SUCURSAL', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  listSales
);

export default router;

