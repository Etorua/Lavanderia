import { Router } from 'express';
import { listPublicProducts, getProductByQR, createProduct } from '../controllers/product.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();

// Catálogo público
router.get('/public', listPublicProducts);

// Búsqueda express mediante escáner QR o código de barras
router.get('/qr/:code', authenticateJWT, getProductByQR);

// Creación de producto
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('SUPERADMIN', 'CLIENTE_ADMIN', 'CONTABILIDAD_CORP', 'COMPRADOR_CORP'),
  createProduct
);

export default router;

