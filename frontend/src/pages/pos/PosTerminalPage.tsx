import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { getStoredQuotations, convertReservationToSale } from '../../data/quotationsData';
import { saveCounterTicket, CounterTicket } from '../../data/billingData';
import { Link } from 'react-router-dom';
import {
  Search,
  QrCode,
  PauseCircle,
  PlayCircle,
  Trash2,
  CreditCard,
  Banknote,
  Send,
  AlertOctagon,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShoppingCart,
  Printer,
  CheckCircle2,
  Receipt,
  ExternalLink,
  User,
  Plus,
  Boxes,
  X,
} from 'lucide-react';

// Productos de catálogo local inmediato para el POS de Lavandería & Tintorería
const CATALOG_PRODUCTS: Product[] = [
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
    sku: 'EQ-PRENS-08',
    qr_code: 'QR-EQ-PRENS-08',
    name: 'Funda Térmica y Almohadilla de Silicona para Prensa Tintorería',
    category: 'Refacciones & Planchado',
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
  {
    id: 'p12',
    sku: 'SERV-TINT-12',
    qr_code: 'QR-SERV-TINT-12',
    name: 'Servicio Tintorería Especializada Traje Completo 2 Piezas',
    category: 'Servicios & Planchaduría',
    price: 160.0,
    cost: 45.0,
    stock: 99,
    reserved_stock: 5,
    in_transit_stock: 0,
    safety_stock: 20,
    min_stock: 20,
    max_stock: 200,
    lead_time_days: 1,
    is_active: true,
  },
];

export const PosTerminalPage: React.FC = () => {
  const { user } = useAuth();
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    total,
    standbyTickets,
    pauseToStandby,
    resumeFromStandby,
    deleteStandby,
    activeQuotationFolio,
  } = useCart();

  const [search, setSearch] = useState('');
  const [quotationSearch, setQuotationSearch] = useState('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [customerName, setCustomerName] = useState('Público en General');
  const [showStandbyDrawer, setShowStandbyDrawer] = useState(false);
  const [standbyNote, setStandbyNote] = useState('');
  const [saleSuccess, setSaleSuccess] = useState<string | null>(null);
  const [completedTicketModal, setCompletedTicketModal] = useState<CounterTicket | null>(null);

  // Verificación de Candado Comercial
  const isBranchLocked = user?.branch?.is_locked;

  // Filtrado de productos en catálogo táctil
  const filteredProducts = CATALOG_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.qr_code.toLowerCase().includes(search.toLowerCase())
  );

  // Búsqueda y jalar reserva/cotización por folio (ej. COT-2026-0042)
  const handleLoadQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationSearch.trim()) return;

    const allQuotes = getStoredQuotations();
    const query = quotationSearch.trim().toLowerCase();
    const found = allQuotes.find(
      (q) => q.folio.toLowerCase() === query || q.folio.toLowerCase().includes(query)
    );

    if (found) {
      clearCart();
      found.items.forEach((item) => {
        addItem(item.product, item.quantity);
      });
      convertReservationToSale(found.id);
      setCustomerName(found.client_name);
      setSaleSuccess(`¡Reserva/Cotización ${found.folio} jalada a Venta Directa de Mostrador! (${found.client_name})`);
      setQuotationSearch('');
    } else {
      alert(`Folio "${quotationSearch}" no encontrado en Cotizaciones ni Reservas.`);
    }
  };

  // Simulación de escáner QR rápido
  const handleSimulateScan = () => {
    const randomProduct = CATALOG_PRODUCTS[Math.floor(Math.random() * CATALOG_PRODUCTS.length)];
    addItem(randomProduct, 1);
  };

  // Procesar cobro en mostrador y generar ticket oficial
  const handleCheckout = () => {
    if (items.length === 0) return;
    const paidNum = amountPaid === '' ? total : Number(amountPaid);
    if (paymentMethod === 'EFECTIVO' && paidNum < total) {
      alert(`El efectivo ingresado ($${paidNum}) es menor al total ($${total}).`);
      return;
    }

    const folioTicket = `TICK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotalCalc = Number((total / 1.16).toFixed(2));
    const ivaCalc = Number((total - subtotalCalc).toFixed(2));
    const changeCalc = paymentMethod === 'EFECTIVO' ? Math.max(0, paidNum - total) : 0;

    const newTicket: CounterTicket = {
      folio: folioTicket,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      branchName: user?.branch?.name || 'Sucursal Matriz Centro',
      cashierName: user?.full_name ? user.full_name.split(' (')[0] : 'Cajero en Turno',
      customerName: customerName.trim() || 'Público en General',
      paymentMethod,
      items: items.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        quantity: it.quantity,
        price: it.unit_price,
        subtotal: it.subtotal,
      })),
      subtotal: subtotalCalc,
      iva: ivaCalc,
      total,
      amountPaid: paidNum,
      changeGiven: changeCalc,
      isBilled: false,
    };

    saveCounterTicket(newTicket);
    setCompletedTicketModal(newTicket);
    setSaleSuccess(
      `¡Venta ${folioTicket} registrada con éxito por $${total.toFixed(2)} (${paymentMethod})! Stock actualizado.`
    );
    clearCart();
    setAmountPaid('');
    setCustomerName('Público en General');
  };

  const changeDue = amountPaid !== '' ? Math.max(0, Number(amountPaid) - total) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={ShoppingCart}
        title="Venta Directa (Mostrador)"
        subtitle="Punto de venta express para mostrador, despacho inmediato de insumos, cobro rápido y generación de tickets para auto-facturación."
        actions={
          <button
            onClick={() => setShowStandbyDrawer(true)}
            className="btn-secundario cursor-pointer"
            title="Ver tickets en espera"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Tickets en Standby ({standbyTickets.length})</span>
          </button>
        }
      />

      {/* Banner de Candado Comercial si la sucursal está bloqueada */}
      {isBranchLocked && (
        <div className="p-4 bg-red-600 text-white rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0 text-white animate-bounce" />
            <div>
              <p className="font-bold text-sm">TERMINAL BLOQUEADA POR CANDADO COMERCIAL</p>
              <p className="text-xs text-red-100">
                {user?.branch?.lock_reason || 'Consumo mensual por debajo del mínimo pactado. Ventas congeladas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notificación de éxito si ocurrió una venta */}
      {saleSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
          <span>{saleSuccess}</span>
          <button onClick={() => setSaleSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {/* Contenedor Principal en 2 Columnas (Catálogo + Ticket) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 1. SECCIÓN IZQUIERDA: CATÁLOGO TÁCTIL, BUSCADOR Y FOLIO COTIZACIÓN (8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
          {/* Barra superior de herramientas: Buscador + Escáner QR + Carga de Cotización */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
            {/* Input Buscador */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:border-black"
              />
            </div>

            {/* Botón Simular Escáner QR / Pistola */}
            <div className="md:col-span-2">
              <button
                onClick={handleSimulateScan}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors"
                title="Simular lectura de pistola de código de barras / QR"
              >
                <QrCode className="w-4 h-4 text-pink-300" />
                <span>Escanear QR</span>
              </button>
            </div>

            {/* Input Rápido para Cotización por Folio */}
            <div className="md:col-span-4">
              <form onSubmit={handleLoadQuotation} className="flex gap-1.5">
                <div className="relative flex-1">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Folio: COT-..."
                    value={quotationSearch}
                    onChange={(e) => setQuotationSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 bg-pink-50/50 border border-pink-200 text-[#580f36] placeholder:text-pink-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-[#580f36]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#580f36] hover:bg-[#430b29] text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                  title="Cargar cotización al carro"
                >
                  Cargar
                </button>
              </form>
            </div>
          </div>

          {/* Listado de Insumos en Formato Tabla ERP (Sin cartas) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="max-h-[580px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Código SKU</th>
                    <th className="py-2.5 px-3">Insumo / Descripción</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3 text-center">Stock Disponible</th>
                    <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                        No se encontraron insumos con ese criterio.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const available = product.stock - product.reserved_stock;
                      const isOutOfStock = available <= 0;

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isOutOfStock ? 'opacity-50 bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[#580f36]">
                              {product.sku}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {product.name}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                            {product.category}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                                isOutOfStock
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : available <= product.safety_stock
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <Boxes className="w-3 h-3" />
                              <span>{available} pzas</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              disabled={isOutOfStock || isBranchLocked}
                              onClick={() => addItem(product, 1)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all shadow-2xs ${
                                isOutOfStock || isBranchLocked
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#580f36] hover:bg-[#430b29] text-white cursor-pointer active:scale-95'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Agregar</span>
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
        </div>

        {/* 2. SECCIÓN DERECHA: TICKET, COBRO Y TOTALES (4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Cabecera del Carrito */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Ticket de Mostrador</span>
                {activeQuotationFolio && (
                  <span className="text-[10px] bg-pink-100 text-[#580f36] px-2 py-0.5 rounded-full font-mono font-bold border border-pink-200">
                    Cot: {activeQuotationFolio}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 font-medium">{items.length} productos agregados</p>
            </div>

            <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
              Mostrador Activo
            </span>
          </div>

          {/* Selector Rápido de Cliente */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cliente (ej: Público en General)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none flex-1"
            />
            {customerName !== 'Público en General' && (
              <button
                type="button"
                onClick={() => setCustomerName('Público en General')}
                className="text-[10px] text-[#580f36] hover:underline font-bold cursor-pointer"
              >
                Público General
              </button>
            )}
          </div>

          {/* Lista de Artículos en el Carrito */}
          <div className="p-4 space-y-2 max-h-[320px] min-h-[180px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <AlertOctagon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-600">El carrito está vacío</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Haz clic en un producto o escanea su código.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 pr-2">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      ${item.unit_price.toFixed(2)} c/u
                    </p>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-bold text-gray-900 w-14 text-right">
                      ${item.subtotal.toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar partida"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sección de Totales y Cobro */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Resumen numérico */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>IVA (16%):</span>
                <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
                <span>Total a Pagar:</span>
                <span className="text-[#580f36]">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => setPaymentMethod('EFECTIVO')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  paymentMethod === 'EFECTIVO'
                    ? 'bg-[#198754] text-white border-[#198754] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Efectivo</span>
              </button>
              <button
                onClick={() => setPaymentMethod('TARJETA')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  paymentMethod === 'TARJETA'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Tarjeta</span>
              </button>
              <button
                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                  paymentMethod === 'TRANSFERENCIA'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transf.</span>
              </button>
            </div>

            {/* Calculadora de Cambio en Efectivo con botones rápidos */}
            {paymentMethod === 'EFECTIVO' && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Efectivo Recibido:</label>
                    <input
                      type="number"
                      placeholder={`$${total}`}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full mt-1 p-1.5 bg-white border border-gray-300 rounded-md text-xs font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Cambio a Entregar:</label>
                    <div className="w-full mt-1 p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-mono font-extrabold text-right">
                      ${changeDue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Billetes rápidos */}
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <span className="shrink-0 font-bold">Rápido:</span>
                  <button
                    type="button"
                    onClick={() => setAmountPaid(total)}
                    className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                  >
                    Exacto
                  </button>
                  {[100, 200, 500, 1000].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setAmountPaid(bill)}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 cursor-pointer"
                    >
                      ${bill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción: Cobrar y Pausar a Standby */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                disabled={items.length === 0 || isBranchLocked}
                onClick={() => {
                  const ref = prompt('Etiqueta para pausar el ticket (ej: "Mesa 3" o "Juan Perez"):', 'Mesa Mostrador');
                  if (ref) pauseToStandby(ref);
                }}
                title="Pausar ticket y liberar caja"
                className="col-span-1 flex items-center justify-center p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                <PauseCircle className="w-4 h-4" />
              </button>

              <button
                disabled={items.length === 0 || isBranchLocked}
                onClick={handleCheckout}
                className="col-span-3 py-2.5 px-4 btn-agregar w-full justify-center disabled:opacity-50"
              >
                <span>Cobrar ${total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* 3. DRAWER LATERAL DE TICKETS EN ESPERA (STANDBY) */}
      {showStandbyDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-96 bg-white h-full shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-800 text-sm">Tickets en Standby (Espera)</h3>
              </div>
              <button
                onClick={() => setShowStandbyDrawer(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {standbyTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No hay tickets pausados en este momento.
                </div>
              ) : (
                standbyTickets.map((ticket) => {
                  const ticketTotal = ticket.cart_data.reduce((acc, i) => acc + i.subtotal, 0);

                  return (
                    <div
                      key={ticket.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{ticket.reference_name}</span>
                        <span className="font-extrabold text-xs text-indigo-600">
                          ${ticketTotal.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {ticket.cart_data.length} ítems guardados • {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            resumeFromStandby(ticket.id);
                            setShowStandbyDrawer(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Recuperar al Carrito</span>
                        </button>
                        <button
                          onClick={() => deleteStandby(ticket.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      {/* 4. MODAL DE TICKET DE VENTA DE MOSTRADOR (IMPRIMIBLE) */}
      {completedTicketModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCompletedTicketModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón X de Salir / Cerrar Visualizador */}
            <button
              type="button"
              onClick={() => setCompletedTicketModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs z-10"
              title="Cerrar ticket (X)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">LAVACLEAN PRO</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{completedTicketModal.branchName}</p>
              <div className="bg-pink-50 text-[#580f36] p-1.5 rounded-lg border border-pink-200 font-mono font-black text-sm my-1">
                {completedTicketModal.folio}
              </div>
              <p className="text-[10px] text-slate-400">{completedTicketModal.date}</p>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Cliente:</span>
                <span className="font-bold text-slate-800">{completedTicketModal.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Atendido por:</span>
                <span>{completedTicketModal.cashierName}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Pago:</span>
                <span className="font-bold">{completedTicketModal.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-200 py-2.5 my-2 space-y-1.5 text-xs max-h-40 overflow-y-auto">
              {completedTicketModal.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-700 max-w-[190px] truncate">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-bold text-slate-900">${it.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>${completedTicketModal.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (16%):</span>
                <span>${completedTicketModal.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t">
                <span>Total Pagado:</span>
                <span className="text-[#580f36]">${completedTicketModal.total.toFixed(2)} MXN</span>
              </div>
              {completedTicketModal.paymentMethod === 'EFECTIVO' && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Cambio entregado:</span>
                  <span className="font-bold text-emerald-700">${completedTicketModal.changeGiven.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 text-center space-y-1">
              <span className="text-[10px] font-black text-[#580f36] uppercase tracking-wider block">
                ¿Requiere Factura Fiscal CFDI 4.0?
              </span>
              <p className="text-[10px] text-slate-600 leading-tight">
                Facture este ticket dentro de los próximos 30 días en:
              </p>
              <Link
                to="/facturacion"
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#580f36] hover:underline"
              >
                <span>Portal de Facturación en Línea</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                onClick={() => setCompletedTicketModal(null)}
                className="py-2.5 px-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

