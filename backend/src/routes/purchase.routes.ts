import { Router } from 'express';
import { createPurchaseOrder, listPurchaseOrders, receivePurchaseOrder } from '../controllers/purchase.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticateJWT);

// Elaborar orden de compra (Comprador Corporativo / SuperAdmin)
router.post(
  '/',
  authorizeRoles('COMPRADOR_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  createPurchaseOrder
);

// Listar órdenes de compra
router.get(
  '/',
  authorizeRoles('COMPRADOR_CORP', 'ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'),
  listPurchaseOrders
);

// Recepción física de mercancía en almacén contra la orden de compra
router.post(
  '/:id/receive',
  authorizeRoles('ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'SUPERADMIN'),
  receivePurchaseOrder
);

export default router;

