# Plan Maestro de Arquitectura y Desarrollo: Sistema Integral POS, Inventario y Gestión

Documentación persistida en el repositorio para seguimiento del desarrollo.

Consultar el documento interactivo completo generado en el artefacto del sistema o revisar este resumen de diseño:

- **Estructura Monorepo**: `/backend` (Node.js + Express + TypeScript + Prisma) y `/frontend` (React + Vite + Tailwind CSS).
- **Base de Datos**: PostgreSQL con Prisma ORM (modelos: `User`, `Product`, `InventoryMovement`, `Sale`, `SaleItem`, `Quotation`, `QuotationItem`, `StandbyTicket`).
- **Control de Roles (RBAC)**: `ADMIN`, `VENDEDOR`, `ALMACENISTA` y acceso `PÚBLICO` (Catálogo).
- **Punto de Venta (POS)**: Soporte de escáner QR (`html5-qrcode` / lector USB), panel lateral flotante de tickets en espera (`StandbyTicket`), cobro y descuento atómico de stock.
- **Cotizaciones**: Creación de presupuestos con folio y botón "Cargar en carro" que inyecta los artículos al POS y los convierte en venta.
- **Kardex y Analíticas**: Registro obligatorio en `InventoryMovement` por cada salida o merma, cálculo de rotación de stock de los últimos 30 días y alertas de stock bajo.
- **Preparación Móvil**: Servicios HTTP desacoplados en `frontend/src/api/*.ts` 100% compatibles para importarse en React Native (Expo).

