import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  WAREHOUSES,
  canViewAllWarehouses,
  getAssignedWarehouseForRole,
} from '../../data/warehouseData';
import {
  SlidersHorizontal,
  Search,
  ChevronDown,
  Pencil,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Save,
  Plus,
  Building2,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MinMaxProduct extends Product {
  location: string;
  warehouse: string;
}

const INITIAL_MIN_MAX_PRODUCTS: MinMaxProduct[] = [
  // CEDIS
  {
    id: 'cedis-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 140,
    reserved_stock: 12,
    in_transit_stock: 50,
    safety_stock: 30,
    min_stock: 40,
    max_stock: 300,
    lead_time_days: 2,
    location: 'Rampa A / Tarima Químicos 01',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 110,
    reserved_stock: 8,
    in_transit_stock: 40,
    safety_stock: 25,
    min_stock: 35,
    max_stock: 250,
    lead_time_days: 3,
    location: 'Rampa A / Tarima Químicos 02',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    price: 1450.0,
    cost: 980.0,
    stock: 55,
    reserved_stock: 5,
    in_transit_stock: 20,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 120,
    lead_time_days: 5,
    location: 'Jaula Bunkers / Químicos Clasificados',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 280,
    reserved_stock: 20,
    in_transit_stock: 100,
    safety_stock: 50,
    min_stock: 80,
    max_stock: 500,
    lead_time_days: 3,
    location: 'Nave 2 / Pasillo Ganchos',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },

  // SUCURSAL CENTRO (ASIGNADA)
  {
    id: 'sc-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SC',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 18,
    reserved_stock: 4,
    in_transit_stock: 10,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 40,
    lead_time_days: 2,
    location: 'Bodega Centro / Pasillo Q-01',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02-SC',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 14,
    reserved_stock: 2,
    in_transit_stock: 8,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 35,
    lead_time_days: 3,
    location: 'Bodega Centro / Pasillo Q-02',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03-SC',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    price: 1450.0,
    cost: 980.0,
    stock: 6,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 4,
    min_stock: 6,
    max_stock: 20,
    lead_time_days: 5,
    location: 'Jaula Solventes Centro / Anaquel 1',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04-SC',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 32,
    reserved_stock: 6,
    in_transit_stock: 15,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 80,
    lead_time_days: 3,
    location: 'Bodega Centro / Tarima E-01',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p5',
    sku: 'EMP-POL-05',
    qr_code: 'QR-EMP-POL-05-SC',
    name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
    category: 'Empaque & Ganchos',
    price: 890.0,
    cost: 560.0,
    stock: 20,
    reserved_stock: 3,
    in_transit_stock: 5,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 50,
    lead_time_days: 4,
    location: 'Bodega Centro / Estante Bobinas',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06-SC',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    category: 'Desmanchadores & Solventes Secos',
    price: 420.0,
    cost: 240.0,
    stock: 15,
    reserved_stock: 2,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 30,
    lead_time_days: 3,
    location: 'Mostrador Centro / Repisa Desmanchado',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },

  // SUCURSAL NORTE
  {
    id: 'sn-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SN',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 11,
    reserved_stock: 1,
    in_transit_stock: 8,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 30,
    lead_time_days: 2,
    location: 'Almacén Norte / Bodega 1',
    warehouse: 'Sucursal Norte (Módulo Plaza)',
    is_active: true,
  },

  // SUCURSAL SUR
  {
    id: 'ss-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SS',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 19,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 40,
    lead_time_days: 2,
    location: 'Almacén Sur / Tarima Principal',
    warehouse: 'Sucursal Sur Periférico',
    is_active: true,
  },
];

const DEFAULT_MINMAX_COLUMNS: ColumnItem[] = [
  { id: 'sku', label: 'Código SKU / Almacén', visible: true, required: true },
  { id: 'product', label: 'Producto / Categoría', visible: true, required: true },
  { id: 'location', label: 'Ubicación Física', visible: true },
  { id: 'stock', label: 'Stock Actual', visible: true },
  { id: 'min_stock', label: 'Stock Mínimo', visible: true },
  { id: 'safety_stock', label: 'Stock Seguridad', visible: true },
  { id: 'max_stock', label: 'Stock Máximo', visible: true },
  { id: 'lead_time', label: 'Lead Time', visible: true },
  { id: 'diagnostic', label: 'Diagnóstico', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const MinMaxPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MinMaxProduct[]>(INITIAL_MIN_MAX_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'REORDER' | 'OPTIMAL' | 'OVERSTOCK'>('ALL');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_MINMAX_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Control de Acceso por Almacén / Sucursal Asignada
  const userCanViewAll = canViewAllWarehouses(user?.role);
  const userDefaultWarehouse = getAssignedWarehouseForRole(user?.role, user?.branch?.name);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    userCanViewAll ? 'TODOS' : userDefaultWarehouse
  );

  useEffect(() => {
    if (!userCanViewAll) {
      setSelectedWarehouse(userDefaultWarehouse);
    }
  }, [user?.role, user?.branch?.name, userCanViewAll, userDefaultWarehouse]);

  // Modal para modificar Mín/Máx
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MinMaxProduct | null>(null);

  // Campos de edición
  const [editMin, setEditMin] = useState<number | ''>(10);
  const [editMax, setEditMax] = useState<number | ''>(50);
  const [editSafety, setEditSafety] = useState<number | ''>(5);
  const [editLeadTime, setEditLeadTime] = useState<number | ''>(3);
  const [editLocation, setEditLocation] = useState('');

  const categories = [
    'TODAS',
    'Detergentes & Químicos',
    'Suavizantes & Neutralizantes',
    'Desmanchadores & Solventes Secos',
    'Empaque & Ganchos',
    'Refacciones & Planchado',
  ];

  // Productos del almacén activo para métricas
  const scopedProducts = products.filter(
    (p) => selectedWarehouse === 'TODOS' || p.warehouse === selectedWarehouse
  );

  // Métricas
  const totalSku = scopedProducts.length;
  const criticalSku = scopedProducts.filter((p) => p.stock - p.reserved_stock <= p.safety_stock).length;
  const reorderSku = scopedProducts.filter(
    (p) => p.stock - p.reserved_stock <= p.min_stock && p.stock - p.reserved_stock > p.safety_stock
  ).length;
  const overstockSku = scopedProducts.filter((p) => p.stock >= p.max_stock).length;
  const optimalSku = totalSku - criticalSku - reorderSku - overstockSku;

  const filtered = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'TODAS' || item.category === selectedCategory;
    const matchesWh = selectedWarehouse === 'TODOS' || item.warehouse === selectedWarehouse;

    const disp = item.stock - item.reserved_stock;
    const isCrit = disp <= item.safety_stock;
    const isReord = disp <= item.min_stock && !isCrit;
    const isOver = item.stock >= item.max_stock;
    const isOpt = !isCrit && !isReord && !isOver;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CRITICAL' && isCrit) ||
      (statusFilter === 'REORDER' && isReord) ||
      (statusFilter === 'OPTIMAL' && isOpt) ||
      (statusFilter === 'OVERSTOCK' && isOver);

    return matchesSearch && matchesCat && matchesWh && matchesStatus;
  });

  const handleOpenEdit = (p: (typeof INITIAL_MIN_MAX_PRODUCTS)[0]) => {
    setSelectedProduct(p);
    setEditMin(p.min_stock);
    setEditMax(p.max_stock);
    setEditSafety(p.safety_stock);
    setEditLeadTime(p.lead_time_days || 3);
    setEditLocation(p.location);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const min = Number(editMin) || selectedProduct.min_stock;
    const max = Number(editMax) || selectedProduct.max_stock;
    const safety = Number(editSafety) || selectedProduct.safety_stock;
    const lead = Number(editLeadTime) || selectedProduct.lead_time_days || 3;

    if (min >= max) {
      alert('Error: El Stock Mínimo no puede ser mayor o igual al Stock Máximo.');
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              min_stock: min,
              max_stock: max,
              safety_stock: safety,
              lead_time_days: lead,
              location: editLocation || p.location,
            }
          : p
      )
    );

    setShowModal(false);
  };

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={SlidersHorizontal}
        title="Parámetros de Máximos y Mínimos"
        subtitle="Tabla especializada para calibrar umbrales de reorden, stock de seguridad y capacidades tope por producto."
        actions={
          <>
            <Link
              to="/admin/inventory"
              className="btn-secondary-slate"
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Almacén & Kardex ↗</span>
            </Link>

            <button
              onClick={() => {
                if (products.length > 0) handleOpenEdit(products[0]);
              }}
              className="btn-primary-wine"
            >
              <Pencil className="w-4 h-4 text-pink-200" />
              <span>Calibrar Parámetros</span>
            </button>
          </>
        }
      />

      {/* Banner de restricción para Almacenista de Sucursal */}
      {!userCanViewAll && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Almacén Restringido ({user?.role}):</strong> Solo tienes autorización para calibrar y visualizar los parámetros de <strong>{userDefaultWarehouse}</strong>. Los parámetros de CEDIS Central y otras sucursales son gestionados corporativamente.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Solo Sucursal Local
          </span>
        </div>
      )}

      {/* Selector de Almacén (Filtro Superior Ejecutivo) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Almacén Supervisado:</span>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            disabled={!userCanViewAll}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors ${
              !userCanViewAll
                ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 cursor-pointer shadow-xs'
            }`}
          >
            {userCanViewAll && (
              <option value="TODOS">📦 Todos los Almacenes (Consolidado Corporativo)</option>
            )}
            {WAREHOUSES.map((w) => (
              <option key={w.id} value={w.name}>
                {w.type === 'CEDIS' ? '🏭' : '🏪'} {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Mostrando umbrales de:{' '}
            <strong className="text-slate-800">
              {selectedWarehouse === 'TODOS' ? 'Todos los Almacenes' : selectedWarehouse}
            </strong>
          </span>
        </div>
      </div>

      {/* Fila de Tarjetas Ejecutivas de Diagnóstico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Supervisados"
          value={`${totalSku} SKUs`}
          icon={Layers}
          color="slate"
          change="Catálogo activo monitoreado"
          trend="neutral"
        />
        <KpiCard
          label="Nivel Crítico (&le; Seguridad)"
          value={`${criticalSku} SKUs`}
          icon={AlertCircle}
          color="amber"
          change="Riesgo de desabasto"
          trend="down"
        />
        <KpiCard
          label="Punto de Reorden (&le; Mín)"
          value={`${reorderSku} SKUs`}
          icon={AlertTriangle}
          color="wine"
          change="Emitir orden de compra"
          trend="down"
        />
        <KpiCard
          label="Nivel Óptimo Calibrado"
          value={`${optimalSku} SKUs`}
          icon={ShieldCheck}
          color="emerald"
          change="Abastecimiento saludable"
          trend="up"
        />
      </div>

      {/* Barra de Filtros y Búsqueda Ejecutiva */}
      <div className="saas-filter-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por SKU, producto o pasillo/ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`saas-pill-tab ${
                selectedCategory === c ? 'active' : 'inactive'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <ColumnVisibilityDropdown
          columns={columns}
          onChange={handleColumnChange}
          onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
          onReset={() => setColumns(DEFAULT_MINMAX_COLUMNS)}
        />
      </div>

      {/* Tabla Independiente de Mínimos y Máximos (Estilo SaaS Ejecutivo) */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              {isColVisible('sku') && <th className="saas-th w-44 whitespace-nowrap">Código SKU / Almacén</th>}
              {isColVisible('product') && <th className="saas-th min-w-[240px]">Producto / Categoría</th>}
              {isColVisible('location') && <th className="saas-th w-44 whitespace-nowrap">Ubicación Física</th>}
              {isColVisible('stock') && <th className="saas-th text-center w-28 whitespace-nowrap">Stock Actual</th>}
              {isColVisible('min_stock') && <th className="saas-th text-center w-28 whitespace-nowrap">Stock Mínimo</th>}
              {isColVisible('safety_stock') && <th className="saas-th text-center w-28 whitespace-nowrap">Stock Seguridad</th>}
              {isColVisible('max_stock') && <th className="saas-th text-center w-28 whitespace-nowrap">Stock Máximo</th>}
              {isColVisible('lead_time') && <th className="saas-th text-center w-24 whitespace-nowrap">Lead Time</th>}
              {isColVisible('diagnostic') && <th className="saas-th text-center w-28 whitespace-nowrap">Diagnóstico</th>}
              {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                  No se encontraron productos con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const disp = item.stock - item.reserved_stock;
                const isCrit = disp <= item.safety_stock;
                const isReorder = disp <= item.min_stock && !isCrit;
                const isOver = item.stock >= item.max_stock;

                return (
                  <tr key={item.id} className="saas-tr">
                    {/* SKU */}
                    {isColVisible('sku') && (
                      <td className="saas-td whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded text-xs">
                            {item.sku}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                              item.warehouse.includes('CEDIS')
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {item.warehouse.includes('CEDIS') ? 'CEDIS' : item.warehouse.replace('Sucursal ', '')}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Producto & Categoría */}
                    {isColVisible('product') && (
                      <td className="saas-td">
                        <span className="font-bold text-slate-900 block leading-tight text-xs">{item.name}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                          {item.category}
                        </span>
                      </td>
                    )}

                    {/* Ubicación */}
                    {isColVisible('location') && (
                      <td className="saas-td text-slate-600 text-xs">
                        {item.location}
                      </td>
                    )}

                    {/* Stock Actual Físico */}
                    {isColVisible('stock') && (
                      <td className="saas-td text-center font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        {item.stock} uds
                      </td>
                    )}

                    {/* Stock Mínimo */}
                    {isColVisible('min_stock') && (
                      <td className="saas-td text-center font-mono font-bold text-amber-700 text-xs whitespace-nowrap">
                        {item.min_stock} uds
                      </td>
                    )}

                    {/* Stock Seguridad */}
                    {isColVisible('safety_stock') && (
                      <td className="saas-td text-center font-mono font-bold text-rose-700 text-xs whitespace-nowrap">
                        {item.safety_stock} uds
                      </td>
                    )}

                    {/* Stock Máximo */}
                    {isColVisible('max_stock') && (
                      <td className="saas-td text-center font-mono font-bold text-blue-700 text-xs whitespace-nowrap">
                        {item.max_stock} uds
                      </td>
                    )}

                    {/* Lead Time */}
                    {isColVisible('lead_time') && (
                      <td className="saas-td text-center text-slate-600 text-xs whitespace-nowrap">
                        {item.lead_time_days || 3} días
                      </td>
                    )}

                    {/* Diagnóstico */}
                    {isColVisible('diagnostic') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`saas-badge ${
                            isCrit
                              ? 'saas-badge-danger'
                              : isReorder
                              ? 'saas-badge-warning'
                              : isOver
                              ? 'saas-badge-info'
                              : 'saas-badge-success'
                          }`}
                        >
                          {isCrit
                            ? 'CRÍTICO'
                            : isReorder
                            ? 'REORDEN'
                            : isOver
                            ? 'EXCEDENTE'
                            : 'ÓPTIMO'}
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="action-btn action-btn-edit"
                            title="Modificar mínimos y máximos"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer de Tabla con Resumen */}
        <div className="saas-table-footer">
          <span>
            Mostrando {filtered.length} de {products.length} productos supervisados
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>
              Requieren Compra (&le; Mín): <strong className="text-amber-700">{criticalSku + reorderSku}</strong>
            </span>
            <span>
              En Rango Óptimo: <strong className="text-emerald-700">{optimalSku}</strong>
            </span>
            <span>
              Con Excedente: <strong className="text-blue-700">{overstockSku}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Modal Reutilizable ERP para Modificar Mínimos y Máximos */}
      <ErpModal
        isOpen={showModal && !!selectedProduct}
        onClose={() => setShowModal(false)}
        title="Modificar Parámetros de Mínimos y Máximos"
        breadcrumb={['Inicio', 'Máximos y Mínimos', 'Calibración de Umbrales']}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="minmax-modal-form"
              className="erp-btn-primary"
            >
              Guardar Parámetros
            </button>
          </div>
        }
      >
        {selectedProduct && (
          <form id="minmax-modal-form" onSubmit={handleSave} className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
              <p className="font-bold text-gray-900">{selectedProduct.name}</p>
              <p className="text-gray-500 font-mono text-[11px] mt-0.5">
                SKU: {selectedProduct.sku} &bull; Stock físico actual: <strong>{selectedProduct.stock} uds</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ubicación Física en Almacén <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pasillo B-03 / Estante 4 / Nivel 2"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="erp-input font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Stock Mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editMin}
                  onChange={(e) => setEditMin(Number(e.target.value))}
                  className="erp-input font-bold text-center text-amber-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Punto de reorden</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seguridad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editSafety}
                  onChange={(e) => setEditSafety(Number(e.target.value))}
                  className="erp-input font-bold text-center text-red-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Fondo de reserva</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Stock Máximo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editMax}
                  onChange={(e) => setEditMax(Number(e.target.value))}
                  className="erp-input font-bold text-center text-blue-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Capacidad tope</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tiempo de Entrega del Proveedor (Lead Time en Días):
              </label>
              <input
                type="number"
                min="1"
                value={editLeadTime}
                onChange={(e) => setEditLeadTime(Number(e.target.value))}
                className="erp-input font-medium"
              />
            </div>
          </form>
        )}
      </ErpModal>
    </div>
  );
};

