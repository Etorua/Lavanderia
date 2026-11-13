import React, { useState } from 'react';
import { Product } from '../../types';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  Tag,
  History,
  Pencil,
  Trash2,
  TrendingUp,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  DollarSign,
  Layers,
  Percent,
} from 'lucide-react';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 45,
    reserved_stock: 4,
    in_transit_stock: 20,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 100,
    lead_time_days: 2,
    is_active: true,
  },
  {
    id: 'p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 35,
    reserved_stock: 2,
    in_transit_stock: 15,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 80,
    lead_time_days: 3,
    is_active: true,
  },
  {
    id: 'p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    price: 1450.0,
    cost: 980.0,
    stock: 18,
    reserved_stock: 1,
    in_transit_stock: 10,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 5,
    is_active: true,
  },
  {
    id: 'p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 80,
    reserved_stock: 8,
    in_transit_stock: 50,
    safety_stock: 20,
    min_stock: 30,
    max_stock: 200,
    lead_time_days: 3,
    is_active: true,
  },
  {
    id: 'p5',
    sku: 'EMP-POL-05',
    qr_code: 'QR-EMP-POL-05',
    name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
    category: 'Empaque & Ganchos',
    price: 890.0,
    cost: 560.0,
    stock: 50,
    reserved_stock: 5,
    in_transit_stock: 25,
    safety_stock: 12,
    min_stock: 20,
    max_stock: 120,
    lead_time_days: 4,
    is_active: true,
  },
  {
    id: 'p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    category: 'Desmanchadores & Solventes Secos',
    price: 420.0,
    cost: 240.0,
    stock: 28,
    reserved_stock: 3,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 60,
    lead_time_days: 3,
    is_active: true,
  },
  {
    id: 'p7',
    sku: 'EQ-PLANC-07',
    qr_code: 'QR-EQ-PLANC-07',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    category: 'Refacciones & Planchado',
    price: 320.0,
    cost: 180.0,
    stock: 22,
    reserved_stock: 0,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 40,
    lead_time_days: 4,
    is_active: true,
  },
  {
    id: 'p8',
    sku: 'LAV-OXI-10',
    qr_code: 'QR-LAV-OXI-10',
    name: 'Blanqueador Oxigenado Textil en Polvo Saco 25kg (Color Seguro)',
    category: 'Detergentes & Químicos',
    price: 950.0,
    cost: 590.0,
    stock: 40,
    reserved_stock: 6,
    in_transit_stock: 20,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 100,
    lead_time_days: 3,
    is_active: true,
  },
];

interface AuditRecord {
  id: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  oldCost: number;
  newCost: number;
  changedBy: string;
  reason: string;
  date: string;
}

const DEFAULT_PRICING_COLUMNS: ColumnItem[] = [
  { id: 'sku', label: 'SKU', visible: true, required: true },
  { id: 'product', label: 'Producto', visible: true, required: true },
  { id: 'category', label: 'Categoría', visible: true },
  { id: 'cost', label: 'Costo Base ($)', visible: true },
  { id: 'price', label: 'Precio Venta ($)', visible: true },
  { id: 'margin', label: 'Margen Bruto (%)', visible: true },
  { id: 'stock', label: 'Stock Actual', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const PricingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('TODAS');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_PRICING_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Modal Crear / Editar
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Campos formulario
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Detergentes & Químicos');
  const [price, setPrice] = useState<number | ''>(500);
  const [cost, setCost] = useState<number | ''>(300);
  const [stock, setStock] = useState<number | ''>(20);
  const [changeReason, setChangeReason] = useState('');

  // Historial de auditoría
  const [history, setHistory] = useState<AuditRecord[]>([
    {
      id: 'h-1',
      productName: 'Detergente Enzimático Industrial 20L (Biodegradable)',
      oldPrice: 640.0,
      newPrice: 680.0,
      oldCost: 390.0,
      newCost: 420.0,
      changedBy: 'Lic. Sofia Morales (Contabilidad Corp)',
      reason: 'Actualización de costos por lista oficial del fabricante de químicos',
      date: 'Hoy, 09:15 AM',
    },
  ]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const categories = [
    'TODAS',
    'Detergentes & Químicos',
    'Suavizantes & Neutralizantes',
    'Desmanchadores & Solventes Secos',
    'Empaque & Ganchos',
    'Refacciones & Planchado',
  ];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'TODAS' || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setSku(`PROD-${Date.now().toString().slice(-4)}`);
    setName('');
    setCategory('Materiales de Construcción');
    setPrice(100);
    setCost(60);
    setStock(20);
    setChangeReason('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setCost(p.cost);
    setStock(p.stock);
    setChangeReason('');
    setShowModal(true);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${prodName}" de la lista oficial de precios?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price === '' || cost === '') return;

    const np = Number(price);
    const nc = Number(cost);
    const ns = Number(stock) || 0;

    if (editingProduct) {
      // Modificar existente
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, name, category, price: np, cost: nc, stock: ns }
            : p
        )
      );

      // Auditoría
      const newRecord: AuditRecord = {
        id: `h-${Date.now()}`,
        productName: name,
        oldPrice: editingProduct.price,
        newPrice: np,
        oldCost: editingProduct.cost,
        newCost: nc,
        changedBy: 'Lic. Sofia Morales (Contabilidad Corp)',
        reason: changeReason || 'Ajuste comercial autorizado por Contabilidad',
        date: 'Justo ahora',
      };
      setHistory([newRecord, ...history]);
    } else {
      // Agregar nuevo producto
      const newP: Product = {
        id: `p-${Date.now()}`,
        sku: sku.toUpperCase(),
        qr_code: `QR-${sku.toUpperCase()}`,
        name,
        category,
        price: np,
        cost: nc,
        stock: ns,
        reserved_stock: 0,
        in_transit_stock: 0,
        safety_stock: 5,
        min_stock: 10,
        max_stock: 50,
        lead_time_days: 3,
        is_active: true,
      };
      setProducts([newP, ...products]);

      const newRecord: AuditRecord = {
        id: `h-${Date.now()}`,
        productName: name,
        oldPrice: 0,
        newPrice: np,
        oldCost: 0,
        newCost: nc,
        changedBy: 'Lic. Sofia Morales (Contabilidad Corp)',
        reason: 'Alta de nuevo producto en catálogo',
        date: 'Justo ahora',
      };
      setHistory([newRecord, ...history]);
    }

    setShowModal(false);
  };

  const totalValuadoVenta = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalCostoBase = products.reduce((acc, p) => acc + p.cost * p.stock, 0);
  const margenPromedio = (
    products.reduce((acc, p) => acc + (p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0), 0) /
    (products.length || 1)
  ).toFixed(1);

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={Tag}
        title="Precios, Costos & Márgenes (Contabilidad)"
        subtitle="Solo el perfil de Contabilidad y SuperAdmin pueden alterar precios de venta y costos base. Todo cambio es inmutable y auditado."
        actions={
          <>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="btn-secondary-slate"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Ver Historial ({history.length})</span>
            </button>

            <button onClick={handleOpenCreate} className="btn-primary-wine">
              <Plus className="w-4 h-4 text-pink-200" />
              <span>+ Nuevo Precio / Producto</span>
            </button>
          </>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Precios y Rentabilidad) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Catálogo Valuado (Venta)"
          value={`$${totalValuadoVenta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="wine"
          change="Precio público total"
          trend="neutral"
        />
        <KpiCard
          label="Costo Base Adquisición"
          value={`$${totalCostoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={Layers}
          color="slate"
          change="Costo contable de almacén"
          trend="neutral"
        />
        <KpiCard
          label="Margen Bruto Promedio"
          value={`${margenPromedio}%`}
          icon={Percent}
          color={Number(margenPromedio) >= 30 ? 'emerald' : 'amber'}
          change={Number(margenPromedio) >= 30 ? 'Rentabilidad saludable' : 'Margen bajo supervisión'}
          trend={Number(margenPromedio) >= 30 ? 'up' : 'down'}
        />
        <KpiCard
          label="Líneas Auditadas"
          value={products.length}
          icon={Tag}
          color="blue"
          change={`${history.length} cambios registrados`}
          trend="neutral"
        />
      </div>

      {/* Barra de Búsqueda y Filtros Ejecutiva */}
      <div className="saas-filter-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por SKU o nombre de producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`saas-pill-tab ${
                selectedCat === c ? 'active' : 'inactive'
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
          onReset={() => setColumns(DEFAULT_PRICING_COLUMNS)}
        />
      </div>

      {/* Tabla de Productos con Precios y Márgenes (Estilo SaaS Ejecutivo) */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              {isColVisible('sku') && <th className="saas-th w-32 whitespace-nowrap">SKU</th>}
              {isColVisible('product') && <th className="saas-th min-w-[240px]">Producto</th>}
              {isColVisible('category') && <th className="saas-th w-36 whitespace-nowrap">Categoría</th>}
              {isColVisible('cost') && <th className="saas-th text-right w-32 whitespace-nowrap">Costo Base ($)</th>}
              {isColVisible('price') && <th className="saas-th text-right w-32 whitespace-nowrap">Precio Venta ($)</th>}
              {isColVisible('margin') && <th className="saas-th text-center w-32 whitespace-nowrap">Margen Bruto (%)</th>}
              {isColVisible('stock') && <th className="saas-th text-center w-28 whitespace-nowrap">Stock Actual</th>}
              {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                  No se encontraron productos registrados para esta búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const margin =
                  p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : '0';

                return (
                  <tr key={p.id} className="saas-tr">
                    {isColVisible('sku') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded-md">
                          {p.sku}
                        </span>
                      </td>
                    )}

                    {isColVisible('product') && (
                      <td className="saas-td">
                        <p className="font-bold text-slate-900 text-xs leading-snug">{p.name}</p>
                      </td>
                    )}

                    {isColVisible('category') && (
                      <td className="saas-td text-slate-600 text-xs whitespace-nowrap">{p.category}</td>
                    )}

                    {isColVisible('cost') && (
                      <td className="saas-td text-right font-mono font-medium text-slate-700 text-xs whitespace-nowrap">
                        ${p.cost.toFixed(2)}
                      </td>
                    )}

                    {isColVisible('price') && (
                      <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        ${p.price.toFixed(2)}
                      </td>
                    )}

                    {isColVisible('margin') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`saas-badge ${
                            Number(margin) >= 40
                              ? 'saas-badge-success'
                              : Number(margin) >= 20
                              ? 'saas-badge-info'
                              : 'saas-badge-warning'
                          }`}
                        >
                          {margin}%
                        </span>
                      </td>
                    )}

                    {isColVisible('stock') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-xs">
                          {p.stock} UDS
                        </span>
                      </td>
                    )}

                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="action-btn action-btn-edit"
                            title="Modificar precio o costo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="action-btn action-btn-delete"
                            title="Restablecer precio de lista"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {products.length} productos</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Margen Promedio: <strong className="text-slate-900">{margenPromedio}%</strong></span>
          </div>
        </div>
      </div>

      {/* Modal ERP: Crear / Modificar Precio y Costo */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Modificar Precio & Costo' : 'Agregar Nuevo Producto'}
        breadcrumb={['Inicio', 'Precios & Costos', editingProduct ? 'Modificar Valores' : 'Nuevo Producto']}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="erp-btn-primary"
            >
              {editingProduct ? 'Actualizar Precios' : 'Registrar en Catálogo'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Código SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!!editingProduct}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="erp-input font-mono font-bold uppercase disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stock Inicial (Uds)
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="erp-input font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre Comercial del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Porcelanato Calacatta 60x120cm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Categoría / Departamento
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="erp-input"
            >
              <option value="Materiales de Construcción">Materiales de Construcción</option>
              <option value="Herramientas & Maquinaria">Herramientas & Maquinaria</option>
              <option value="Pinturas & Recubrimientos">Pinturas & Recubrimientos</option>
              <option value="Plomería & Baños">Plomería & Baños</option>
              <option value="Iluminación & Hogar">Iluminación & Hogar</option>
              <option value="Alimentos & Bebidas">Alimentos & Bebidas</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Costo Base ($ MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="erp-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Precio Venta Público ($ MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="erp-input font-bold text-black"
              />
            </div>
          </div>

          {/* Cálculo en Vivo del Margen */}
          {Number(price) > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">Margen Bruto Calculado:</span>
              <span className="font-extrabold text-black text-sm">
                {(((Number(price) - Number(cost)) / Number(price)) * 100).toFixed(1)}%
              </span>
            </div>
          )}

          {editingProduct && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo del Ajuste (Obligatorio para Auditoría) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Ej. Cambio de lista de proveedor o acuerdo corporativo"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="erp-input normal-case"
              />
            </div>
          )}
        </form>
      </ErpModal>

      {/* Modal ERP: Historial de Auditoría Inmutable */}
      <ErpModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Auditoría de Modificaciones de Precios"
        breadcrumb={['Inicio', 'Precios & Costos', 'Historial Inmutable']}
        size="lg"
        footer={
          <button
            onClick={() => setShowHistoryModal(false)}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
          >
            Cerrar Auditoría
          </button>
        }
      >
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {history.map((h) => (
            <div key={h.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-900 text-sm">{h.productName}</p>
                <span className="text-[10px] text-gray-400 font-medium">{h.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Precio de Venta</span>
                  <div className="flex items-center gap-2 mt-0.5 font-bold">
                    <span className="text-gray-400 line-through">${h.oldPrice.toFixed(2)}</span>
                    <span className="text-emerald-700 font-extrabold text-sm">&rarr; ${h.newPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Costo Base</span>
                  <div className="flex items-center gap-2 mt-0.5 font-bold">
                    <span className="text-gray-400 line-through">${h.oldCost.toFixed(2)}</span>
                    <span className="text-gray-900 font-extrabold text-sm">&rarr; ${h.newCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-600">
                <strong>Motivo registrado: </strong> {h.reason}
              </div>
              <div className="text-[10px] text-gray-500 font-medium">
                Autorizado por: {h.changedBy}
              </div>
            </div>
          ))}
        </div>
      </ErpModal>
    </div>
  );
};
