import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, ShieldAlert, Menu, User } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  // Fecha y hora en vivo estilo Stanza Málaga
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      // Capitalizar primer letra del día
      setCurrentDate(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));

      setCurrentTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
      {/* Lado Izquierdo: Botón Menú Móvil + Fecha y Hora en vivo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Botón Hamburguesa en Móvil y Tablet */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-[#580f36] hover:bg-pink-50 transition-colors cursor-pointer border border-slate-200"
          title="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-[#580f36]" />
        </button>

        {/* Branding Móvil */}
        <div className="flex items-center gap-2 lg:hidden">
          <img src="/logo.svg" alt="LavaClean Pro Logo" className="w-7 h-7 rounded-lg object-contain shrink-0" />
          <span className="text-xs font-black text-[#580f36] tracking-tight">
            Lava<span className="text-pink-600">Clean</span>
          </span>
        </div>

        {/* Fecha y Hora (Visible en pantallas medianas y grandes) */}
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-gray-700 capitalize">
            {currentDate}
          </span>
          <span className="text-[11px] font-mono font-bold text-gray-400">
            {currentTime} hrs
          </span>
        </div>

        {/* Badge de Sucursal */}
        {user?.branch && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
            <Store className="w-3.5 h-3.5 text-gray-600" />
            <span>{user.branch.name}</span>
            <span className="text-gray-400 font-mono">({user.branch.code})</span>
          </div>
        )}

        {/* Alerta de Candado */}
        {user?.branch?.is_locked && (
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-[11px] font-bold animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span>Candado Activo</span>
          </div>
        )}
      </div>

      {/* Lado derecho: Perfil rápido en móvil / tablet */}
      <div className="flex items-center gap-2">
        <div className="lg:hidden flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-[#580f36]">
          <div className="w-5 h-5 rounded-full bg-[#580f36] text-white flex items-center justify-center text-[10px]">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
          <span className="max-w-[100px] truncate">{user?.role}</span>
        </div>
      </div>
    </header>
  );
};
