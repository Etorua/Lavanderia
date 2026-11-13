import { Router } from 'express';
import { createCustomerOrder, listCustomerOrders } from '../controllers/order.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createCustomerOrder);
router.get('/', listCustomerOrders);

export default router;

