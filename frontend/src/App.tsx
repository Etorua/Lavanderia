import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BannerProvider } from './context/BannerContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Vistas
import { CatalogPage } from './pages/public/CatalogPage';
import { OnlineBillingPage } from './pages/public/OnlineBillingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { CounterSalePage } from './pages/sales/CounterSalePage';
import { CashierPage } from './pages/cashier/CashierPage';
import { PosTerminalPage } from './pages/pos/PosTerminalPage';
import { QuotationsPage } from './pages/quotations/QuotationsPage';
import { ReservationsPage } from './pages/reservations/ReservationsPage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { CashCutPage } from './pages/cashcut/CashCutPage';
import { PricingPage } from './pages/pricing/PricingPage';
import { BranchesPage } from './pages/branches/BranchesPage';
import { DashboardPage } from './pages/analytics/DashboardPage';
import { MarketingBannersPage } from './pages/marketing/MarketingBannersPage';
import { PurchasesPage } from './pages/purchases/PurchasesPage';
import { SuppliersPage } from './pages/suppliers/SuppliersPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { WarehouseEntriesPage } from './pages/inventory/WarehouseEntriesPage';
import { WarehouseTransfersPage } from './pages/inventory/WarehouseTransfersPage';
import { MinMaxPage } from './pages/inventory/MinMaxPage';

// Layout exclusivo de la Ventana 3 (Panel de Administración)
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Si no está autenticado, redirigir a la Ventana 2 (Login)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 ml-0 lg:ml-[260px] flex flex-col min-w-0 transition-all duration-300">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ======================================================== */}
      {/* VENTANA 1: PÁGINA PRINCIPAL / CATÁLOGO PÚBLICO          */}
      {/* Es la ventana que ve cualquier persona al iniciar.       */}
      {/* ======================================================== */}
      <Route path="/" element={<CatalogPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/facturacion" element={<OnlineBillingPage />} />

      {/* ======================================================== */}
      {/* VENTANA 2: MÓDULO DE LOGIN                              */}
      {/* Pantalla dedicada para autenticación de personal.       */}
      {/* ======================================================== */}
      <Route path="/login" element={<LoginPage />} />

      {/* ======================================================== */}
      {/* VENTANA 3: PANEL DE ADMINISTRACIÓN Y OPERACIÓN          */}
      {/* Protegido, requiere login. Incluye Mostrador, Caja, etc. */}
      {/* ======================================================== */}
      {/* Módulo 1: Venta de Mostrador (Vendedor) */}
      <Route
        path="/admin/counter-sale"
        element={
          <AdminLayout>
            <CounterSalePage />
          </AdminLayout>
        }
      />
      {/* Módulo 2: Caja de Cobro (Cajero / Terminal) */}
      <Route
        path="/admin/cashier"
        element={
          <AdminLayout>
            <CashierPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/pos"
        element={
          <AdminLayout>
            <CashierPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/quotations"
        element={
          <AdminLayout>
            <QuotationsPage />
          </AdminLayout>
        }
      />
      {/* Módulo de Reservas y Apartados (48h) */}
      <Route
        path="/admin/reservations"
        element={
          <AdminLayout>
            <ReservationsPage />
          </AdminLayout>
        }
      />
      {/* Módulo de Facturas y CFDIs */}
      <Route
        path="/admin/invoices"
        element={
          <AdminLayout>
            <InvoicesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/cash-cuts"
        element={
          <AdminLayout>
            <CashCutPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/pricing"
        element={
          <AdminLayout>
            <PricingPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/branches"
        element={
          <AdminLayout>
            <BranchesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminLayout>
            <DashboardPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/purchases"
        element={
          <AdminLayout>
            <PurchasesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/suppliers"
        element={
          <AdminLayout>
            <SuppliersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <AdminLayout>
            <InventoryPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/inventory/entries"
        element={
          <AdminLayout>
            <WarehouseEntriesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/inventory/transfers"
        element={
          <AdminLayout>
            <WarehouseTransfersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/min-max"
        element={
          <AdminLayout>
            <MinMaxPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/marketing"
        element={
          <AdminLayout>
            <MarketingBannersPage />
          </AdminLayout>
        }
      />

      {/* Redirección automática de cualquier ruta no reconocida a la Ventana 1 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BannerProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </BannerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
