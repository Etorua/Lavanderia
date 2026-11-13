import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Check, Eye, RotateCcw, X } from 'lucide-react';

export interface ColumnItem {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean; // Si es requerida (ej. Acciones o Folio), no se puede desmarcar
}

interface ColumnVisibilityDropdownProps {
  columns: ColumnItem[];
  onChange: (id: string, visible: boolean) => void;
  onShowAll?: () => void;
  onReset?: () => void;
  className?: string;
}

export const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  columns,
  onChange,
  onShowAll,
  onReset,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const visibleCount = columns.filter((c) => c.visible).length;
  const totalCount = columns.length;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        title="Personalizar qué columnas mostrar en la tabla"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#580f36]" />
        <span>Columnas</span>
        <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2.5 px-3 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-extrabold text-slate-900 text-xs">Visibilidad de Columnas</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2 max-h-60 overflow-y-auto space-y-1">
            {columns.map((col) => (
              <label
                key={col.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                  col.visible
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={col.visible}
                    disabled={col.required}
                    onChange={(e) => onChange(col.id, e.target.checked)}
                    className="w-3.5 h-3.5 text-[#580f36] rounded border-slate-300 focus:ring-[#580f36] cursor-pointer"
                  />
                  <span>{col.label}</span>
                </div>
                {col.required && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Fija
                  </span>
                )}
              </label>
            ))}
          </div>

          <div className="pt-2 mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            {onShowAll && (
              <button
                type="button"
                onClick={onShowAll}
                className="text-[#580f36] hover:underline font-bold cursor-pointer"
              >
                Mostrar todas
              </button>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

