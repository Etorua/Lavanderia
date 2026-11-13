import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import {
  saveStoredCounterOrder,
  getStoredCounterOrders,
  cancelCounterOrder,
  CounterOrder,
} from '../../data/counterSalesData';
import { Product } from '../../types';
import {
  Search,
  ShoppingCart,
  Send,
  User,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  QrCode,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Package,
  Plus,
  Eye,
  XCircle,
  TrendingUp,
  Receipt,
  Calendar,
  Building,
  Check,
  X,
  Layers,
  Filter,
  Tag,
  Boxes,
} from 'lucide-react';

// Catálogo enriquecido con marcas, categorías y stock de LavaClean Pro
const COUNTER_PRODUCTS: (Product & { brand: string })[] = [
  {
    id: 'p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab ProTextil',
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
    brand: 'AquaSoft Industrial',
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
    brand: 'DryClean Chem',
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
    brand: 'MetalForm Tintorería',
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
    brand: 'PoliPack Express',
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
    brand: 'Ecolab ProTextil',
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
    brand: 'SilverStar Pro',
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
    sku: 'EQ-PRENS-08',
    qr_code: 'QR-EQ-PRENS-08',
    name: 'Funda Térmica y Almohadilla de Silicona para Prensa Tintorería',
    category: 'Refacciones & Planchado',
    brand: 'SilverStar Pro',
    price: 780.0,
    cost: 460.0,
    stock: 14,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 3,
    min_stock: 5,
    max_stock: 25,
    lead_time_days: 5,
    is_active: true,
  },
  {
    id: 'p9',
    sku: 'EMP-CINT-09',
    qr_code: 'QR-EMP-CINT-09',
    name: 'Cintas de Marcaje Textil Inalterable para Tintorería (10 Rollos)',
    category: 'Empaque & Ganchos',
    brand: 'PoliPack Express',
    price: 290.0,
    cost: 160.0,
    stock: 65,
    reserved_stock: 4,
    in_transit_stock: 30,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 150,
    lead_time_days: 2,
    is_active: true,
  },
  {
    id: 'p10',
    sku: 'LAV-OXI-10',
    qr_code: 'QR-LAV-OXI-10',
    name: 'Blanqueador Oxigenado Textil en Polvo Saco 25kg (Color Seguro)',
    category: 'Detergentes & Químicos',
    brand: 'Ecolab ProTextil',
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
  {
    id: 'p11',
    sku: 'LAV-NEUT-11',
    qr_code: 'QR-LAV-NEUT-11',
    name: 'Neutralizante Anticalcáreo & Antiamarilleo Textil 10L',
    category: 'Suavizantes & Neutralizantes',
    brand: 'AquaSoft Industrial',
    price: 390.0,
    cost: 220.0,
    stock: 25,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 50,
    lead_time_days: 4,
    is_active: true,
  },
];

const CATEGORIES = [
  'TODAS',
  'Detergentes & Químicos',
  'Suavizantes & Neutralizantes',
  'Desmanchadores & Solventes Secos',
  'Empaque & Ganchos',
  'Refacciones & Planchado',
];

const BRANDS = [
  'TODAS',
  'Ecolab ProTextil',
  'AquaSoft Industrial',
  'DryClean Chem',
  'MetalForm Tintorería',
  'PoliPack Express',
  'SilverStar Pro',
];

const FREQUENT_CLIENTS = [
  'Público en General',
  'Tintorería Express El Rosario',
  'Lavandería San José Centro',
  'Tintorería & Planchaduría Premier',
  'Hotel Boutique & Spa Reforma',
];

interface CartLine {
  product: Product & { brand: string };
  quantity: number;
}

export const CounterSalePage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CounterOrder[]>([]);
  const [searchTable, setSearchTable] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'PENDIENTE_PAGO' | 'PAGADO' | 'CANCELADO'>('TODAS');

  // Modos de Vista (Listado vs Nueva Venta en Pantalla Completa - Sin Pop-ups)
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [viewingOrder, setViewingOrder] = useState<CounterOrder | null>(null);
  const [confirmedOrderModal, setConfirmedOrderModal] = useState<CounterOrder | null>(null);

  // Estados del formulario y múltiples filtros en el Modal de Nueva Venta
  const [customerName, setCustomerName] = useState('Público en General');
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // MÚLTIPLES FILTROS PARA EL BUSCADOR DE PRODUCTOS:
  const [filterQuery, setFilterQuery] = useState(''); // Búsqueda por código/SKU o nombre
  const [filterCategory, setFilterCategory] = useState('TODAS'); // Búsqueda por categoría
  const [filterBrand, setFilterBrand] = useState('TODAS'); // Búsqueda por marca
  const [filterStockStatus, setFilterStockStatus] = useState<'TODOS' | 'DISPONIBLE' | 'CRITICO'>('TODOS'); // Filtro por stock
  const [quantitiesToAdd, setQuantitiesToAdd] = useState<Record<string, number>>({});

  const loadOrders = () => {
    setOrders(getStoredCounterOrders());
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('counter_orders_updated', loadOrders);
    return () => window.removeEventListener('counter_orders_updated', loadOrders);
  }, []);

  // Agregar producto al carrito desde la tabla con su cantidad especificada
  const handleAddProduct = (product: Product & { brand: string }) => {
    const qty = quantitiesToAdd[product.id] && quantitiesToAdd[product.id] > 0 ? quantitiesToAdd[product.id] : 1;
    setFormError(null);

    setCartLines((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    // Resetear cantidad de ese producto a 1
    setQuantitiesToAdd((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const handleUpdateLineQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCartLines((prev) => prev.filter((it) => it.product.id !== productId));
    } else {
      setCartLines((prev) =>
        prev.map((it) => (it.product.id === productId ? { ...it, quantity: qty } : it))
      );
    }
  };

  const handleRemoveLine = (productId: string) => {
    setCartLines((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Cálculos del modal
  const modalTotal = cartLines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const modalSubtotal = Number((modalTotal / 1.16).toFixed(2));
  const modalIva = Number((modalTotal - modalSubtotal).toFixed(2));

  // Generar Orden y Enviar a Caja
  const handleConfirmAndSendToCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartLines.length === 0) {
      setFormError('Agrega al menos un insumo a la orden antes de mandarla a caja.');
      return;
    }

    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `ORD-2026-${folioNum}`;

    const newOrder: CounterOrder = {
      id: `ord-${Date.now()}`,
      folio,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sellerName: user?.full_name ? user.full_name.split(' (')[0] : 'Vendedor de Mostrador',
      customerName: customerName.trim() || 'Público en General',
      branchName: user?.branch?.name || 'Sucursal Matriz Centro',
      items: cartLines.map((it) => ({
        id: it.product.id,
        sku: it.product.sku,
        name: it.product.name,
        quantity: it.quantity,
        price: it.product.price,
        subtotal: it.product.price * it.quantity,
      })),
      subtotal: modalSubtotal,
      iva: modalIva,
      total: modalTotal,
      status: 'PENDIENTE_PAGO',
    };

    saveStoredCounterOrder(newOrder);
    setViewMode('list');
    setCartLines([]);
    setCustomerName('Público en General');
    setFilterQuery('');
    setFormError(null);
    setConfirmedOrderModal(newOrder);
    loadOrders();
  };

  const handleCancelOrder = (orderId: string, folio: string) => {
    if (confirm(`¿Estás seguro de cancelar la orden ${folio}?`)) {
      cancelCounterOrder(orderId);
      loadOrders();
    }
  };

  // MULTIFILTRO DE PRODUCTOS (Código/SKU, Nombre, Categoría, Marca y Stock)
  const filteredCatalog = COUNTER_PRODUCTS.filter((p) => {
    const q = filterQuery.toLowerCase().trim();
    const matchesCodeOrName =
      q === '' ||
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.qr_code.toLowerCase().includes(q);

    const matchesCategory = filterCategory === 'TODAS' || p.category === filterCategory;
    const matchesBrand = filterBrand === 'TODAS' || p.brand === filterBrand;

    let matchesStock = true;
    if (filterStockStatus === 'DISPONIBLE') {
      matchesStock = p.stock > 0;
    } else if (filterStockStatus === 'CRITICO') {
      matchesStock = p.stock <= 20;
    }

    return matchesCodeOrName && matchesCategory && matchesBrand && matchesStock;
  });

  // Filtrado de la tabla principal
  const filteredOrders = orders.filter((o) => {
    const term = searchTable.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      o.folio.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.sellerName.toLowerCase().includes(term) ||
      (o.ticketFolio && o.ticketFolio.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'TODAS' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Métricas
  const totalVentasMostrador = orders.length;
  const pendientesEnCaja = orders.filter((o) => o.status === 'PENDIENTE_PAGO').length;
  const cobradasConExito = orders.filter((o) => o.status === 'PAGADO').length;
  const montoCobrado = orders
    .filter((o) => o.status === 'PAGADO')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {viewMode === 'list' ? (
        <>
          {/* ======================================================== */}
          {/* 1. CABECERA CON BOTÓN PRINCIPAL: + NUEVA VENTA           */}
          {/* ======================================================== */}
          <PageHeader
            icon={ShoppingCart}
            title="Venta de Mostrador (Vendedor)"
            subtitle="Registro y control de órdenes de mostrador despachadas a ventanilla de caja."
            actions={
              <button
                onClick={() => {
                  setCartLines([]);
                  setCustomerName('Público en General');
                  setFilterQuery('');
                  setFilterCategory('TODAS');
                  setFilterBrand('TODAS');
                  setFilterStockStatus('TODOS');
                  setFormError(null);
                  setViewMode('create');
                }}
                className="btn-primary-wine"
              >
                <Plus className="w-4 h-4 text-pink-200" />
                <span>+ Nueva Venta</span>
              </button>
            }
          />

      {/* ======================================================== */}
      {/* 2. TARJETAS DE INDICADORES / KPIS                        */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Órdenes Mostrador</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{totalVentasMostrador}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Generadas hoy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Esperando Pago en Caja</span>
          <span className="text-2xl font-black text-amber-600 block mt-1">{pendientesEnCaja}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Clientes en fila</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Cobradas con Éxito</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{cobradasConExito}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Tickets expedidos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Monto Cobrado Hoy</span>
          <span className="text-2xl font-black text-[#580f36] block mt-1">
            ${montoCobrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Ingresos en mostrador</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BARRA DE BÚSQUEDA Y FILTROS TABLA PRINCIPAL           */}
      {/* ======================================================== */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar orden por folio (ORD-XXXX), cliente, vendedor o ticket fiscal..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#580f36]"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600 shrink-0">
          {(['TODAS', 'PENDIENTE_PAGO', 'PAGADO', 'CANCELADO'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === tab ? 'bg-white text-[#580f36] shadow-2xs font-black' : 'hover:text-slate-900'
              }`}
            >
              {tab === 'TODAS'
                ? 'Todas'
                : tab === 'PENDIENTE_PAGO'
                ? `En Caja (${pendientesEnCaja})`
                : tab === 'PAGADO'
                ? 'Cobradas'
                : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. TABLA PRINCIPAL DE ÓRDENES                            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Folio Orden</th>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Vendedor Mostrador</th>
                <th className="py-3 px-4">Partidas Despachadas</th>
                <th className="py-3 px-4 text-right">Total ($ MXN)</th>
                <th className="py-3 px-4 text-center">Estado en Caja</th>
                <th className="py-3 px-4 text-center">Ticket Fiscal</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
                    <span>No se encontraron órdenes de mostrador registradas.</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isPaid = ord.status === 'PAGADO';
                  const isCancelled = ord.status === 'CANCELADO';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-xs text-[#580f36] block">
                          {ord.folio}
                        </span>
                        <span className="text-[10px] text-slate-400">{ord.branchName}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {ord.createdAt}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block max-w-xs truncate">
                          {ord.customerName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {ord.sellerName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className="text-slate-700 block max-w-xs truncate"
                          title={ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        >
                          {ord.items.length} partidas ({ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm font-mono">
                        ${ord.total.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Cobrado en Caja</span>
                            </>
                          ) : isCancelled ? (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Cancelada</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Esperando en Caja</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {ord.ticketFolio ? (
                          <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {ord.ticketFolio}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Pendiente de pago</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="action-btn action-btn-view"
                            title="Ver Ficha de Pase a Caja"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isPaid && !isCancelled && (
                            <button
                              onClick={() => handleCancelOrder(ord.id, ord.folio)}
                              className="action-btn action-btn-delete"
                              title="Cancelar Orden"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  ) : (
    /* ======================================================== */
    /* VISTA COMPLETA: NUEVA VENTA DIRECTA (SIN POP-UPS)        */
    /* ======================================================== */
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera Superior Integrada */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Volver a la lista de órdenes"
          >
            <ArrowLeft className="w-4 h-4 text-[#580f36]" />
            <span>Volver al Listado</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Nueva Venta de Mostrador</span>
              <span className="text-xs bg-pink-100 text-[#580f36] px-2.5 py-0.5 rounded-full font-bold">
                Despacho a Caja
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Búsqueda multicriterio de insumos en listado, cálculo en tiempo real y pase a ventanilla de caja.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={cartLines.length === 0}
            onClick={handleConfirmAndSendToCashier}
            className="px-5 py-2.5 bg-[#580f36] hover:bg-[#430b29] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4 text-pink-200" />
            <span>Generar Orden y Mandar a Caja</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* SECCIÓN 1: SELECCIÓN DE CLIENTE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#580f36]" />
            Cliente / Razón Social:
          </label>
          <span className="text-[10px] text-slate-400">Público en general o clientes registrados</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe el nombre del cliente o tintorería..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
          />
          {customerName !== 'Público en General' && (
            <button
              type="button"
              onClick={() => setCustomerName('Público en General')}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Público General
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 mr-1">Clientes frecuentes:</span>
          {FREQUENT_CLIENTS.map((cli) => (
            <button
              key={cli}
              type="button"
              onClick={() => setCustomerName(cli)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                customerName === cli
                  ? 'bg-[#580f36] text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-700'
              }`}
            >
              {cli}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: BUSCADOR MULTICRITERIO Y TABLA DE INSUMOS (LISTADO - SIN CARTAS) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-[#580f36]" />
              Búsqueda Multicriterio de Insumos:
            </span>
            <span className="text-[10px] font-black text-[#580f36] bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">
              {filteredCatalog.length} productos disponibles
            </span>
          </div>

          {(filterQuery || filterCategory !== 'TODAS' || filterBrand !== 'TODAS' || filterStockStatus !== 'TODOS') && (
            <button
              type="button"
              onClick={() => {
                setFilterQuery('');
                setFilterCategory('TODAS');
                setFilterBrand('TODAS');
                setFilterStockStatus('TODOS');
              }}
              className="text-[11px] font-bold text-[#580f36] hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Fila con los 4 filtros combinados */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Filtro 1: Código / SKU o Nombre */}
          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              1. Buscar por Código / SKU o Nombre:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Código (LAV-DET-01) o descripción..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
              />
            </div>
          </div>

          {/* Filtro 2: Categoría */}
          <div className="sm:col-span-3">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              2. Categoría / Departamento:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 3: Marca */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              3. Marca:
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
            >
              {BRANDS.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro 4: Disponibilidad de Stock */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              4. Existencias:
            </label>
            <select
              value={filterStockStatus}
              onChange={(e) => setFilterStockStatus(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
            >
              <option value="TODOS">Todos los stocks</option>
              <option value="DISPONIBLE">Con Stock (&gt;0)</option>
              <option value="CRITICO">Stock Bajo (&le;20)</option>
            </select>
          </div>
        </div>

        {/* TABLA DE RESULTADOS DE BÚSQUEDA EN FORMATO LISTADO (SIN CARTAS) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Código SKU</th>
                <th className="py-2.5 px-3">Insumo / Descripción</th>
                <th className="py-2.5 px-3">Categoría & Marca</th>
                <th className="py-2.5 px-3 text-center">Stock Disponible</th>
                <th className="py-2.5 px-3 text-right">Precio</th>
                <th className="py-2.5 px-3 text-center">Cantidad</th>
                <th className="py-2.5 px-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron insumos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((prod) => {
                  const qty = quantitiesToAdd[prod.id] || 1;
                  const inOrder = cartLines.find((c) => c.product.id === prod.id);

                  return (
                    <tr key={prod.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="py-2 px-3 font-mono font-black text-slate-700 text-[11px] whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[#580f36]">
                          {prod.sku}
                        </span>
                      </td>

                      <td className="py-2 px-3 font-bold text-slate-900 max-w-[240px]">
                        {prod.name}
                      </td>

                      <td className="py-2 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                        <span className="block font-semibold text-slate-700">{prod.category}</span>
                        <span className="block text-[10px] text-slate-400">{prod.brand}</span>
                      </td>

                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                            prod.stock <= 0
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : prod.stock <= 15
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          <span>{prod.stock} pzas</span>
                        </span>
                      </td>

                      <td className="py-2 px-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                        ${prod.price.toFixed(2)}
                      </td>

                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantitiesToAdd((prev) => ({
                                ...prev,
                                [prod.id]: Math.max(1, (prev[prod.id] || 1) - 1),
                              }))
                            }
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-black text-xs cursor-pointer select-none transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={prod.stock}
                            value={qty}
                            onChange={(e) =>
                              setQuantitiesToAdd((prev) => ({
                                ...prev,
                                [prod.id]: Math.max(1, Math.min(prod.stock, parseInt(e.target.value) || 1)),
                              }))
                            }
                            className="w-11 text-center font-bold text-xs bg-white border-x border-slate-300 py-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQuantitiesToAdd((prev) => ({
                                ...prev,
                                [prod.id]: Math.min(prod.stock, (prev[prod.id] || 1) + 1),
                              }))
                            }
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-black text-xs cursor-pointer select-none transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleAddProduct(prod)}
                          className="px-3 py-1.5 bg-[#580f36] hover:bg-[#430b29] text-white rounded-lg text-xs font-bold flex items-center gap-1 mx-auto cursor-pointer shadow-xs active:scale-95 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar</span>
                          {inOrder && (
                            <span className="bg-pink-300 text-[#580f36] text-[10px] font-black px-1.5 rounded-full ml-1">
                              {inOrder.quantity}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 3: PARTIDAS DE LA ORDEN ACTUAL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#580f36]" />
            Partidas en la Orden ({cartLines.length}):
          </label>
          {cartLines.length > 0 && (
            <button
              type="button"
              onClick={() => setCartLines([])}
              className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              Vaciar lista
            </button>
          )}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Código & Insumo</th>
                <th className="py-2.5 px-4 text-center">Cantidad</th>
                <th className="py-2.5 px-4 text-right">Precio Unitario</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
                <th className="py-2.5 px-4 text-center">Quitar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cartLines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-1 stroke-1" />
                    <span className="text-xs font-bold text-slate-600 block">
                      No has agregado insumos a esta orden.
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Usa los filtros de arriba para encontrar insumos y agregarlos con un clic.
                    </span>
                  </td>
                </tr>
              ) : (
                cartLines.map((it) => (
                  <tr key={it.product.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{it.product.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {it.product.sku} • {it.product.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateLineQty(it.product.id, it.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold min-w-[28px] text-center">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateLineQty(it.product.id, it.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${it.product.price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                      ${(it.product.price * it.quantity).toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(it.product.id)}
                        className="w-7 h-7 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                        title="Eliminar partida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SECCIÓN 4: TOTALES Y RESUMEN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar y Volver al Listado
          </button>

          <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">${modalSubtotal.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA Trasladado (16%):</span>
              <span className="font-semibold text-slate-900">${modalIva.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total a Pagar en Caja:</span>
              <span className="text-[#580f36] text-lg font-black">${modalTotal.toFixed(2)} MXN</span>
            </div>
          </div>
        </div>

        {/* BOTÓN FINAL DE CONFIRMAR */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={cartLines.length === 0}
            onClick={handleConfirmAndSendToCashier}
            className="w-full sm:w-auto px-8 py-3 bg-[#580f36] hover:bg-[#430b29] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4 text-pink-200" />
            <span>Generar Orden y Mandar a Caja</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )}

      {/* ======================================================== */}
      {/* 6. MODAL: DETALLE DE ORDEN / FICHA DE PASE A CAJA        */}
      {/* ======================================================== */}
      {(viewingOrder || confirmedOrderModal) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setViewingOrder(null);
            setConfirmedOrderModal(null);
          }}
        >
          {(() => {
            const ord = viewingOrder || confirmedOrderModal!;
            return (
              <div
                className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fade-in relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón X para salir del visualizador */}
                <button
                  type="button"
                  onClick={() => {
                    setViewingOrder(null);
                    setConfirmedOrderModal(null);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs z-10"
                  title="Cerrar ventana (X)"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Orden de Mostrador</h3>
                  <p className="text-xs text-slate-500">
                    Pase a ventanilla de caja para realizar su pago:
                  </p>
                  <div className="bg-pink-50 border-2 border-dashed border-[#580f36] text-[#580f36] py-3 px-4 rounded-xl font-mono font-black text-2xl tracking-wider my-2">
                    {ord.folio}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Cliente: <strong>{ord.customerName}</strong> • {ord.items.length} partidas
                  </span>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden text-xs max-h-44 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Partida</th>
                        <th className="p-2 text-center">Cant</th>
                        <th className="p-2 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ord.items.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2 text-slate-800">{it.name}</td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right font-mono font-bold">${it.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Total a Pagar en Caja:</span>
                    <span className="text-[#580f36] text-base font-black">
                      ${ord.total.toFixed(2)} MXN
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Vendedor: {ord.sellerName} • {ord.createdAt}
                  </span>
                  {ord.ticketFolio && (
                    <span className="text-[11px] font-bold text-emerald-700 block pt-1">
                      Ticket Pagado: {ord.ticketFolio} ({ord.paymentMethod})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Ficha</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewingOrder(null);
                      setConfirmedOrderModal(null);
                    }}
                    className="py-2.5 px-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
