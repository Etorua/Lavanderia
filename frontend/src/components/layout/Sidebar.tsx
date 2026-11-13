import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  ShoppingCart,
  FileText,
  DollarSign,
  Tag,
  Store,
  TrendingUp,
  Package,
  Truck,
  SlidersHorizontal,
  Megaphone,
  LogOut,
  Building,
  Building2,
  ChevronDown,
  PackageCheck,
  ArrowLeftRight,
  Clock,
  Receipt,
  CreditCard,
  FileCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'CAJERO';

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    loginAsRole(e.target.value as UserRole);
  };

  const links = [
    {
      to: '/admin/counter-sale',
      label: 'Venta de Mostrador (Vendedor)',
      icon: ShoppingCart,
      roles: ['VENDEDOR', 'ADMIN_SUCURSAL', 'SUPERADMIN', 'CLIENTE_ADMIN'],
    },
    {
      to: '/admin/cashier',
      label: 'Caja de Cobro (Cajero)',
      icon: CreditCard,
      roles: ['CAJERO', 'FINANZAS_SUCURSAL', 'ADMIN_SUCURSAL', 'SUPERADMIN'],
    },
    {
      to: '/admin/quotations',
      label: 'Cotizaciones',
      icon: FileText,
      roles: ['VENDEDOR', 'ADMIN_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/reservations',
      label: 'Reservas (Apartados 48h)',
      icon: Clock,
      roles: ['VENDEDOR', 'CAJERO', 'ADMIN_SUCURSAL', 'ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/invoices',
      label: 'Facturación & CFDIs',
      icon: FileCheck,
      roles: ['CONTABILIDAD_CORP', 'ADMIN_SUCURSAL', 'FINANZAS_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/cash-cuts',
      label: 'Corte de Caja Diario',
      icon: DollarSign,
      roles: ['CAJERO', 'FINANZAS_SUCURSAL', 'ADMIN_SUCURSAL', 'CONTABILIDAD_CORP', 'SUPERADMIN'],
    },
    {
      to: '/admin/pricing',
      label: 'Precios & Costos (Contabilidad)',
      icon: Tag,
      roles: ['CONTABILIDAD_CORP', 'SUPERADMIN'],
    },
    {
      to: '/admin/branches',
      label: 'Puntos de Venta & Candados',
      icon: Store,
      roles: ['CLIENTE_ADMIN', 'ADMIN_SUCURSAL', 'CONTABILIDAD_CORP', 'SUPERADMIN'],
    },
    {
      to: '/admin/marketing',
      label: 'Banners & Publicidad',
      icon: Megaphone,
      roles: ['MARKETING', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/purchases',
      label: 'Órdenes de Compra (PO)',
      icon: Truck,
      roles: ['COMPRADOR_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/suppliers',
      label: 'Proveedores (RFC & Catálogo)',
      icon: Building2,
      roles: ['COMPRADOR_CORP', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/inventory',
      label: 'Kardex & Almacén',
      icon: Package,
      roles: ['ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'ADMIN_SUCURSAL', 'COMPRADOR_CORP', 'CLIENTE_ADMIN', 'CONTABILIDAD_CORP', 'SUPERADMIN'],
    },
    {
      to: '/admin/inventory/entries',
      label: 'Entradas & Recepción',
      icon: PackageCheck,
      roles: ['ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'ADMIN_SUCURSAL', 'COMPRADOR_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/inventory/transfers',
      label: 'Salidas & Traspasos',
      icon: ArrowLeftRight,
      roles: ['ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'ADMIN_SUCURSAL', 'CLIENTE_ADMIN', 'SUPERADMIN'],
    },
    {
      to: '/admin/min-max',
      label: 'Máximos y Mínimos',
      icon: SlidersHorizontal,
      roles: ['ALMACENISTA_CENTRAL', 'ALMACENISTA_SUCURSAL', 'ADMIN_SUCURSAL', 'COMPRADOR_CORP', 'CLIENTE_ADMIN', 'CONTABILIDAD_CORP', 'SUPERADMIN'],
    },
    {
      to: '/admin/analytics',
      label: 'Pronósticos & Dead Stock',
      icon: TrendingUp,
      roles: ['COMPRADOR_CORP', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'ADMIN_SUCURSAL', 'SUPERADMIN'],
    },
  ];

  const visibleLinks = links.filter((l) => l.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop para cerrar el sidebar en móviles y tablets */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity cursor-pointer"
          title="Toca para cerrar menú"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 shadow-2xl select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(88, 15, 54, 0.96) 0%, rgba(55, 6, 33, 0.98) 100%), url("/images/sidebar-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Cabecera del Sidebar con Logo */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="LavaClean Pro Logo" className="w-10 h-10 rounded-xl shadow-xs object-contain shrink-0" />
            <div className="leading-tight">
              <h2 className="text-white font-bold text-base tracking-wide">
                Lava<span className="text-pink-300">Clean</span> Pro
              </h2>
              <p className="text-white/60 text-[10px] font-normal uppercase tracking-wider">
                Lavandería & Tintorería
              </p>
            </div>
          </div>

          {/* Botón X de cierre en Móvil y Tablet */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Cerrar menú lateral"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menú de Navegación */}
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1">
          <div className="px-6 mb-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              Módulos del Sistema
            </span>
          </div>

          <nav className="space-y-0.5">
            {visibleLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-4 py-2.5 mx-3 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/15 font-bold shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Barra indicadora vertical activa (Estilo Stanza Málaga) */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r shadow-xs" />
                    )}
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-white scale-110' : 'text-white/70 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Pie del Sidebar: Usuario, Salir y Selector de Perfiles */}
        <div className="p-3.5 border-t border-white/10 bg-black/20 shrink-0 space-y-3">
          {/* Fila Usuario + Salir */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
                {user?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.full_name || 'Administrador'}
                </p>
                <p className="text-[10px] text-pink-200/80 truncate font-mono">
                  {user?.role || 'SUPERADMIN'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Perfil de Operación */}
          <div className="pt-2 border-t border-white/10">
            <label className="text-[9px] font-bold text-white/50 uppercase tracking-wider block mb-1">
              Perfil de Operación:
            </label>
            <div className="relative">
              <select
                value={user?.role || 'SUPERADMIN'}
                onChange={handleRoleChange}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold text-[11px] py-1.5 px-2.5 pr-7 rounded-lg border border-white/20 focus:outline-none focus:border-pink-300 cursor-pointer appearance-none transition-colors"
              >
              <option value="SUPERADMIN" className="bg-[#4a082b] text-white">👑 Super Administrador</option>
              <option value="CLIENTE_ADMIN" className="bg-[#4a082b] text-white">🏢 Director General (Dueño)</option>
              <option value="ADMIN_SUCURSAL" className="bg-[#4a082b] text-white">👔 Gerente de Sucursal</option>
              <option value="CAJERO" className="bg-[#4a082b] text-white">🏧 Cajero de Mostrador</option>
              <option value="VENDEDOR" className="bg-[#4a082b] text-white">💼 Vendedor de Mostrador</option>
              <option value="FINANZAS_SUCURSAL" className="bg-[#4a082b] text-white">💵 Finanzas de Sucursal</option>
              <option value="ALMACENISTA_SUCURSAL" className="bg-[#4a082b] text-white">📦 Almacén de Sucursal</option>
              <option value="ALMACENISTA_CENTRAL" className="bg-[#4a082b] text-white">🏢 Almacén Central (CEDIS)</option>
              <option value="COMPRADOR_CORP" className="bg-[#4a082b] text-white">🛒 Compras Corporativas</option>
              <option value="CONTABILIDAD_CORP" className="bg-[#4a082b] text-white">⚖️ Contabilidad Corporativa</option>
              <option value="MARKETING" className="bg-[#4a082b] text-white">📢 Mercadotecnia y Banners</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  </>
);
};
