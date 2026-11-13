import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  showBackButton = false,
  backTo,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="stanza-page-header">
      <div className="stanza-header-left">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-black transition-colors shadow-2xs cursor-pointer"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="stanza-header-icon">
          <Icon className="w-5 h-5 text-[#580f36]" size={20} />
        </div>
        <div>
          <h1 className="stanza-header-title">{title}</h1>
          {subtitle && <p className="stanza-header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {actions && (
        <div className="flex items-center flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

