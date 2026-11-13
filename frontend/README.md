# Frontend Web - Sistema Integral POS, Inventario & Multi-Sucursal

Interfaz moderna y responsiva construida con **React 18, Vite, TypeScript, Tailwind CSS y Lucide Icons**.

---

## 🚀 Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   cd frontend
   npm install
   ```

2. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   O en Windows haciendo doble clic en `iniciar-frontend.bat`.
   Abrirá la aplicación en: **http://localhost:3000**

---

## 🖥️ Módulos y Pantallas Disponibles

### 1. Catálogo Digital Público (`/catalog`)
- Catálogo de productos con fotografías, categoría, precios oficiales vigentes y disponibilidad en tiempo real.
- Buscador predictivo por nombre o SKU.
- Botón *"Agregar al Carrito"* con botón flotante directo al cobro.

### 2. Terminal de Punto de Venta POS (`/pos`)
- **Modo Mostrador Directo (Walk-in)**:
  - Búsqueda táctil o por escáner QR / lector de código de barras.
  - Carrito de compras con cálculo de subtotal, IVA y total.
  - Calculadora de cambio al pagar en efectivo, cobro con tarjeta o transferencia.
- **Modo Cotización a Venta**:
  - Campo rápido para ingresar o escanear el folio de cotización (ej. `COT-2026-0042`).
  - Carga instantánea de los artículos pactados y conversión a venta en 1 clic.
- **Panel Flotante de Tickets en Espera (*Standby*)**:
  - Botón de pausa para guardar el carrito con una referencia (ej. *"Mesa 4"*) y liberar la caja.
  - Drawer lateral para recuperar el ticket en cualquier momento.
- **Candado Comercial en Tiempo Real**:
  - Si la sucursal activa el candado comercial por falta de consumo, la terminal muestra un banner de bloqueo completo congelando las ventas.

### 3. Cotizaciones & Reserva Temporal (`/quotations`)
- Generación de presupuestos con folio correlativo (`COT-XXXX`).
- Selector de **Reserva Temporal de Inventario (48 hrs)** para apartar el producto del disponible mientras se negocia.
- Botón directo *"Cargar en Caja"* que envía los artículos al POS.

### 4. Corte Diario de Caja & Arqueo (`/cash-cuts`)
- Registro de fondo inicial de caja.
- Acumulador continuo de cobros en Efectivo, Tarjeta, Transferencia y Mixto.
- **Arqueo Ciego al Cierre de Turno**: El cajero ingresa el conteo de billetes y monedas.
- **Cálculo Automático de Diferencias**: Determina si existe **Sobrante** o **Faltante**.
- Registro de gastos menores de caja chica (`BranchExpense`).

### 5. Gobierno de Precios por Contabilidad (`/pricing`)
- **Exclusivo para Contabilidad Corporativa y SuperAdmin**.
- Tabla de productos con margen de utilidad bruta ($\frac{\text{precio} - \text{costo}}{\text{precio}} \times 100$).
- Modificación de precios y costos con motivo obligatorio.
- Visor inmutable de la auditoría de cambios de precios (`PriceHistory`).

### 6. Puntos de Venta & Candados Comerciales (`/branches`)
- Medidor del progreso de ventas del mes vs. cuota mínima de consumo.
- Botón de un clic para activar o desactivar el **Candado Comercial** en caso de mora o desabasto.

### 7. Panel de Pronósticos & Salud del Inventario (`/analytics`)
- Algoritmo de sugerencias automáticas de reorden ($Q_{sugerida}$) basado en el Punto de Reorden ($ROP$).
- **Top Fast-Moving**: Productos de alta rotación con días de inventario restante.
- **Detector de Dead Stock**: Productos sin ventas en más de 60 días con cálculo de capital inmovilizado y estrategias de liquidación.

---

## 🔄 Selector Rápido de Perfiles (Navbar)
En la barra superior derecha encontrarás un menú desplegable para alternar en un clic entre:
- 🏧 Cajero de Mostrador
- 💼 Vendedor
- 💵 Finanzas de Sucursal
- 👔 Gerente de Sucursal
- ⚖️ Contabilidad Corporativa
- 🛒 Comprador
- 📦 Almacenista
- 🏢 Director General (Dueño)
- 👑 Super Administrador
- 👤 Cliente Final Web

