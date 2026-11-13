# Backend API - Sistema Integral POS, Inventarios y Gobernanza Multi-Sucursal

API REST transaccional construida con **Node.js, Express, TypeScript, PostgreSQL y Prisma ORM**.

---

## 🚀 Inicio Rápido

1. **Configurar Base de Datos**:
   Copia el archivo `.env.example` a `.env` y coloca tu cadena de conexión de PostgreSQL:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_system?schema=public"
   JWT_SECRET="super_secret_jwt_key_pos_system_2026_xyz"
   ```

2. **Instalar dependencias y generar modelos**:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

3. **Cargar datos iniciales (Seed)**:
   ```bash
   npm run prisma:seed
   ```

4. **Arrancar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   O en Windows haciendo doble clic en `iniciar-backend.bat`.

---

## 👥 Cuentas de Acceso de Prueba (Contraseña: `123456`)

| Nivel | Rol | Correo Electrónico | Descripción |
| :--- | :--- | :--- | :--- |
| **Plataforma** | `SUPERADMIN` | `admin@sistema.com` | Control global, candados comerciales y auditoría total |
| **Corporativo** | `CLIENTE_ADMIN` | `director@alpha.com` | Director General, dueño de franquicia y sucursales |
| **Corporativo** | `CONTABILIDAD_CORP` | `contabilidad.corp@alpha.com` | Exclusivo gobierno de precios, costos y cierre contable |
| **Corporativo** | `COMPRADOR_CORP` | `comprador@alpha.com` | Emisión de Órdenes de Compra (PO) y reabastecimiento |
| **Corporativo** | `ALMACENISTA_CENTRAL`| `cedis@alpha.com` | Almacén Central / CEDIS y despacho de traspasos |
| **Sucursal Centro** | `ADMIN_SUCURSAL` | `gerente.centro@alpha.com` | Gerente de tienda, cancelaciones y cuota mensual |
| **Sucursal Centro** | `FINANZAS_SUCURSAL` | `finanzas.centro@alpha.com`| Auditoría de corte de caja diario y caja chica |
| **Sucursal Centro** | `CAJERO` | `cajero.centro@alpha.com` | Operación de caja, cobro en mostrador y arqueo |
| **Sucursal Centro** | `VENDEDOR` | `vendedor.centro@alpha.com` | Atención, cotizaciones con reserva y preventa |
| **Sucursal Centro** | `ALMACENISTA_SUCURSAL`| `almacen.centro@alpha.com` | Custodia de trastienda y mermas locales |
| **Externo** | `CLIENTE_FINAL` | `cliente@correo.com` | Comprador web B2B/B2C en catálogo |

---

## 📡 Catálogo de Endpoints REST (`/api/v1`)

### 1. Autenticación & Usuarios (`/auth`)
- `POST /api/v1/auth/login`: Autenticación con email/password, retorna JWT y contexto de sucursal.
- `GET /api/v1/auth/me`: Perfil del usuario autenticado.
- `POST /api/v1/auth/users`: Alta de usuarios subordinados según la jerarquía del creador.

### 2. Sucursales & Candado Comercial (`/branches`)
- `GET /api/v1/branches`: Listado de puntos de venta con sus ventas del mes y cuota mínima.
- `POST /api/v1/branches`: Alta de nuevo punto de venta.
- `PATCH /api/v1/branches/:id/lock`: Activa o desactiva el candado comercial con motivo justificado.

### 3. Productos & Escáner QR (`/products`)
- `GET /api/v1/products/public`: Catálogo con filtros y disponibilidad para mostrador/web.
- `GET /api/v1/products/qr/:code`: Búsqueda instantánea por código QR o pistola de código de barras.
- `POST /api/v1/products`: Creación de productos con SKU y niveles de stock.

### 4. Gobierno de Precios por Contabilidad (`/pricing`)
- `PATCH /api/v1/pricing/products/:id`: Modificación oficial de precio y costo (solo Contabilidad/SuperAdmin).
- `GET /api/v1/pricing/products/:id/history`: Cronología de cambios de precio con usuario y motivo.

### 5. Corte Diario de Caja (Cierre Z) & Gastos (`/cash-cuts`)
- `POST /api/v1/cash-cuts/open`: Apertura de caja con fondo inicial.
- `GET /api/v1/cash-cuts/current`: Acumulador en tiempo real de ventas por método de pago.
- `POST /api/v1/cash-cuts/close/:id`: Arqueo ciego; el cajero ingresa efectivo contado y calcula diferencia.
- `POST /api/v1/cash-cuts/audit/:id`: Validación y sellado por Finanzas de Sucursal o Contabilidad.
- `POST /api/v1/cash-cuts/expenses`: Registro de gastos menores de caja chica (`BranchExpense`).

### 6. Cotizaciones con Reserva (`/quotations`)
- `POST /api/v1/quotations`: Genera cotización con folio `COT-XXXX` y opción de reserva temporal por 48h.
- `GET /api/v1/quotations/by-folio/:folio`: Recuperación express por número de folio aceptado por el cliente.
- `POST /api/v1/quotations/release/:id`: Liberación de reserva temporal.

### 7. Ventas & Conversión de Cotizaciones (`/sales`)
- `POST /api/v1/sales/direct`: Venta express en mostrador con cálculo de cambio y afectación de Kardex.
- `POST /api/v1/sales/convert-quotation`: Conversión de cotización aceptada a venta oficial en 1 clic.
- `GET /api/v1/sales`: Historial de ventas.

### 8. Tickets en Espera (`/standby`)
- `POST /api/v1/standby`: Pausa el carrito activo con etiqueta (ej. "Mesa 1") y libera la caja.
- `GET /api/v1/standby`: Lista de carritos pausados en la sucursal.
- `DELETE /api/v1/standby/:id`: Recupera el ticket al carrito activo y lo borra de la lista temporal.

### 9. Compras & Recepción de Almacén (`/purchases`)
- `POST /api/v1/purchases`: Orden de Compra (PO) a proveedor; incrementa stock en tránsito.
- `POST /api/v1/purchases/:id/receive`: Recepción física en almacén, ingreso al Kardex (`ENTRADA_COMPRA`).

### 10. Kardex & Inventarios (`/inventory`)
- `GET /api/v1/inventory/kardex/:productId`: Histórico auditable de movimientos por producto.
- `POST /api/v1/inventory/adjust`: Registro justificado de mermas, daños o ajustes físicos.

### 11. Analíticas Predictivas (`/analytics`)
- `GET /api/v1/analytics/reorder-suggestions`: Sugerencias de reorden automáticas ($Q_{sugerida}$) basadas en ROP.
- `GET /api/v1/analytics/rotation/top`: Top productos de mayor rotación (Fast-Moving).
- `GET /api/v1/analytics/rotation/dead-stock`: Detección de productos sin ventas en 60 días (Dead Stock).
- `GET /api/v1/analytics/commercial-lock-status`: Semáforo de riesgo de candado comercial por sucursal.

