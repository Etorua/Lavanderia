import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importación de rutas
import authRoutes from './routes/auth.routes';
import branchRoutes from './routes/branch.routes';
import productRoutes from './routes/product.routes';
import pricingRoutes from './routes/pricing.routes';
import cashCutRoutes from './routes/cashcut.routes';
import quotationRoutes from './routes/quotation.routes';
import saleRoutes from './routes/sale.routes';
import standbyRoutes from './routes/standby.routes';
import purchaseRoutes from './routes/purchase.routes';
import inventoryRoutes from './routes/inventory.routes';
import analyticsRoutes from './routes/analytics.routes';
import orderRoutes from './routes/order.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Verificación de estado del servidor (Health Check)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Sistema Integral POS, Inventario Inteligente y Gobernanza Multi-Sucursal',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Registro de endpoints de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/cash-cuts', cashCutRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/standby', standbyRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/orders', orderRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor POS Backend iniciado exitosamente`);
  console.log(`📡 URL API: http://localhost:${PORT}/api/v1`);
  console.log(`🩺 Health:  http://localhost:${PORT}/api/v1/health`);
  console.log(`====================================================`);
});

export default app;

