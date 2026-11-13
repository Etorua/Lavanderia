import React, { useState } from 'react';
import { useBanners } from '../../context/BannerContext';
import { Banner } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import {
  Megaphone,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ErpModal } from '../../components/common/ErpModal';

export const MarketingBannersPage: React.FC = () => {
  const { banners, addBanner, updateBanner, toggleBannerStatus, deleteBanner } = useBanners();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'STRIP_BANNER' | 'FLASH_OFFER' | 'MOSAIC_PROMO'>('ALL');
  const [search, setSearch] = useState('');

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [discountTag, setDiscountTag] = useState('');
  const [position, setPosition] = useState<Banner['position']>('MOSAIC_PROMO');
  const [categoryTarget, setCategoryTarget] = useState('Detergentes & Químicos');
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#580f36');

  const filteredBanners = banners.filter((b) => {
    const matchesFilter = selectedFilter === 'ALL' || b.position === selectedFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      (b.discount_tag && b.discount_tag.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('PROMOCIÓN');
    setDiscountTag('HASTA 30% DE AHORRO');
    setPosition('MOSAIC_PROMO');
    setCategoryTarget('Detergentes & Químicos');
    setImageUrl('https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=70');
    setBackgroundColor('#580f36');
    setShowModal(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setBadge(banner.badge || '');
    setDiscountTag(banner.discount_tag || '');
    setPosition(banner.position);
    setCategoryTarget(banner.category_target || 'Detergentes & Químicos');
    setImageUrl(banner.image_url || '');
    setBackgroundColor(banner.background_color || '#580f36');
    setShowModal(true);
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente el banner "${bannerTitle}"?`)) {
      deleteBanner(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingBanner) {
      updateBanner(editingBanner.id, {
        title,
        subtitle,
        badge: badge || 'PROMOCIÓN',
        discount_tag: discountTag || 'OFERTA ESPECIAL',
        position,
        category_target: categoryTarget,
        image_url: imageUrl,
        background_color: backgroundColor,
      });
    } else {
      addBanner({
        title,
        subtitle,
        badge: badge || 'PROMOCIÓN',
        discount_tag: discountTag || 'OFERTA ESPECIAL',
        position,
        category_target: categoryTarget,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=70',
        background_color: backgroundColor,
        is_active: true,
        order: banners.length + 1,
      });
    }

    setShowModal(false);
  };

  const totalActivos = banners.filter((b) => b.is_active).length;
  const totalHero = banners.filter((b) => b.position === 'STRIP_BANNER').length;
  const totalFlash = banners.filter((b) => b.position === 'FLASH_OFFER').length;
  const totalMosaicos = banners.filter((b) => b.position === 'MOSAIC_PROMO').length;

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={Megaphone}
        title="Banners, Publicidad & Promociones"
        subtitle="Administración de campañas promocionales, tiras hero y mosaicos vinculados al Catálogo Público en vivo."
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn-primary-wine"
          >
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nuevo Banner</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas de Campañas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Banners en Catálogo"
          value={banners.length}
          icon={Megaphone}
          color="wine"
          change={`${totalActivos} campañas en vivo`}
          trend="neutral"
        />
        <KpiCard
          label="Tiras Hero (Carrusel)"
          value={totalHero}
          icon={Sparkles}
          color="blue"
          change="Cabecera principal de tienda"
          trend="neutral"
        />
        <KpiCard
          label="Ofertas Relámpago (Flash)"
          value={totalFlash}
          icon={Zap}
          color="amber"
          change="Descuentos de alta urgencia"
          trend="neutral"
        />
        <KpiCard
          label="Mosaicos de Departamento"
          value={totalMosaicos}
          icon={Layers}
          color="emerald"
          change="Navegación visual por categoría"
          trend="neutral"
        />
      </div>

      {/* Barra de Filtros y Búsqueda Ejecutiva */}
      <div className="saas-filter-toolbar">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar banner por título, descuento o departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todos los Banners' },
            { id: 'STRIP_BANNER', label: 'Tiras Hero' },
            { id: 'FLASH_OFFER', label: 'Ofertas Flash' },
            { id: 'MOSAIC_PROMO', label: 'Mosaicos de Depto.' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`saas-pill-tab ${
                selectedFilter === tab.id ? 'active' : 'inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Administrativa de Banners con Diseño SaaS Ejecutivo */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              <th className="saas-th w-24 text-center">Vista Previa</th>
              <th className="saas-th min-w-[200px]">Campaña / Título</th>
              <th className="saas-th w-36 text-center">Ubicación / Tipo</th>
              <th className="saas-th w-32 text-center">Etiqueta Ahorro</th>
              <th className="saas-th w-36">Categoría Vinculada</th>
              <th className="saas-th text-center w-28">Estado</th>
              <th className="saas-th text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBanners.map((banner) => (
              <tr key={banner.id} className="saas-tr">
                {/* Vista Previa */}
                <td className="saas-td text-center">
                  <div
                    style={{ backgroundColor: banner.background_color || '#ea580c' }}
                    className="w-14 h-9 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center relative shadow-xs mx-auto"
                  >
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-white text-center px-1">
                        {banner.badge || 'PROMO'}
                      </span>
                    )}
                  </div>
                </td>

                {/* Campaña & Subtítulo */}
                <td className="saas-td">
                  <span className="font-bold text-slate-900 block text-xs">{banner.title}</span>
                  {banner.subtitle && (
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs mt-0.5">
                      {banner.subtitle}
                    </span>
                  )}
                </td>

                {/* Ubicación / Tipo */}
                <td className="saas-td text-center">
                  <span className="saas-badge saas-badge-info">
                    {banner.position}
                  </span>
                </td>

                {/* Etiqueta de Ahorro */}
                <td className="saas-td text-center">
                  <span className="saas-badge saas-badge-warning">
                    {banner.discount_tag || 'OFERTA'}
                  </span>
                </td>

                {/* Categoría Vinculada */}
                <td className="saas-td font-medium text-slate-700 text-xs">
                  {banner.category_target || 'TODOS'}
                </td>

                {/* Estado */}
                <td className="saas-td text-center">
                  <button
                    onClick={() => toggleBannerStatus(banner.id)}
                    className={`saas-badge cursor-pointer ${
                      banner.is_active ? 'saas-badge-success' : 'saas-badge-neutral'
                    }`}
                    title="Haz clic para alternar visibilidad en catálogo"
                  >
                    {banner.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{banner.is_active ? 'EN VIVO' : 'PAUSADO'}</span>
                  </button>
                </td>

                {/* Acciones */}
                <td className="saas-td text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="action-btn action-btn-edit"
                      title="Modificar banner"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="action-btn action-btn-delete"
                      title="Eliminar banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBanners.length === 0 && (
              <tr>
                <td colSpan={7} className="saas-td text-center text-slate-400 py-12 font-medium">
                  No se encontraron banners con el filtro o búsqueda seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="saas-table-footer">
          <span>Mostrando {filteredBanners.length} de {banners.length} banners publicitarios</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>En Vivo en Catálogo: <strong className="text-emerald-700">{banners.filter((b) => b.is_active).length}</strong></span>
            <span>Pausados: <strong className="text-slate-500">{banners.filter((b) => !b.is_active).length}</strong></span>
          </div>
        </div>
      </div>

      {/* Modal Reutilizable ERP: Crear / Modificar Banner */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBanner ? 'Modificar Banner Publicitario' : 'Crear Nuevo Banner Publicitario'}
        breadcrumb={['Inicio', 'Mercadotecnia', editingBanner ? 'Editar Banner' : 'Nuevo Banner']}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="banner-form"
              className="erp-btn-primary"
            >
              {editingBanner ? 'Guardar Cambios' : 'Publicar Banner'}
            </button>
          </div>
        }
      >
        <form id="banner-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Título de la Campaña:</label>
            <input
              type="text"
              required
              placeholder="Ej. NOVIEMBRE DEL AHORRO ¡NOS ADELANTAMOS!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="erp-input w-full font-bold uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Subtítulo Descriptivo:</label>
            <input
              type="text"
              placeholder="Ej. Hasta 30% de ahorro en línea blanca y calentadores"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="erp-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Tipo / Posición:</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
                className="erp-input w-full"
              >
                <option value="STRIP_BANNER">Tira Hero Superior</option>
                <option value="FLASH_OFFER">Oferta Flash (Trío)</option>
                <option value="MOSAIC_PROMO">Mosaico de Depto.</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Etiqueta de Descuento:</label>
              <input
                type="text"
                placeholder="Ej. HASTA 50% DE AHORRO"
                value={discountTag}
                onChange={(e) => setDiscountTag(e.target.value)}
                className="erp-input w-full text-red-600 font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Departamento Destino:</label>
              <select
                value={categoryTarget}
                onChange={(e) => setCategoryTarget(e.target.value)}
                className="erp-input w-full"
              >
                <option value="Detergentes & Químicos">Detergentes & Químicos</option>
                <option value="Suavizantes & Neutralizantes">Suavizantes & Neutralizantes</option>
                <option value="Desmanchadores & Solventes Secos">Desmanchadores & Solventes Secos</option>
                <option value="Empaque & Ganchos">Empaque & Ganchos</option>
                <option value="Refacciones & Planchado">Refacciones & Planchado</option>
                <option value="Servicios & Planchaduría">Servicios & Planchaduría</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Color de Fondo:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="erp-input flex-1 font-mono text-xs uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">URL de Imagen (Opcional):</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="erp-input w-full font-mono text-xs"
            />
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
