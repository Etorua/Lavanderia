import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ErpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  breadcrumb?: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const ErpModal: React.FC<ErpModalProps> = ({
  isOpen,
  onClose,
  title,
  breadcrumb = ['Inicio', 'Administración'],
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[96vw] h-[92vh]',
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 w-full ${sizeClasses} max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con breadcrumbs estilo ERP */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col">
            <div className="erp-modal-breadcrumb">
              {breadcrumb.map((step, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-gray-300">/</span>}
                  <span className={idx === breadcrumb.length - 1 ? 'text-gray-800' : 'text-gray-500'}>
                    {step}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal con scroll suave */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">{children}</div>

        {/* Footer estándar */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

