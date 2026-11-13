import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import {
  getStoredCounterOrders,
  markOrderAsPaid,
  CounterOrder,
} from '../../data/counterSalesData';
import { saveCounterTicket, CounterTicket } from '../../data/billingData';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Banknote,
  Send,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  Receipt,
  User,
  AlertCircle,
  QrCode,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  X,
} from 'lucide-react';

export const CashierPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CounterOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CounterOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'PENDIENTES' | 'COBRADAS' | 'TODAS'>('PENDIENTES');

  // Estado del cobro
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [completedTicket, setCompletedTicket] = useState<CounterTicket | null>(null);

  // Cargar órdenes
  const loadOrders = () => {
    const list = getStoredCounterOrders();
    setOrders(list);
    // Si no hay orden seleccionada y hay pendientes, preseleccionar la primera pendiente
    if (!selectedOrder) {
      const firstPending = list.find((o) => o.status === 'PENDIENTE_PAGO');
      if (firstPending) setSelectedOrder(firstPending);
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('counter_orders_updated', loadOrders);
    return () => window.removeEventListener('counter_orders_updated', loadOrders);
  }, []);

  // Actualizar amountPaid por defecto al cambiar orden
  useEffect(() => {
    if (selectedOrder) {
      setAmountPaid('');
    }
  }, [selectedOrder?.id]);

  // Filtrado de lista de órdenes
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'PENDIENTES') return matchesSearch && o.status === 'PENDIENTE_PAGO';
    if (statusFilter === 'COBRADAS') return matchesSearch && o.status === 'PAGADO';
    return matchesSearch;
  });

  // Búsqueda directa por folio en el input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const clean = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) => o.folio.toLowerCase() === clean || o.folio.toLowerCase().includes(clean)
    );

    if (found) {
      setSelectedOrder(found);
      setSearchQuery('');
    } else {
      alert(`No se encontró ninguna orden con el folio "${searchQuery}".`);
    }
  };

  const total = selectedOrder ? selectedOrder.total : 0;
  const changeDue =
    amountPaid !== '' && typeof amountPaid === 'number' ? Math.max(0, amountPaid - total) : 0;

  // Procesar cobro en caja
  const handleProcessPayment = () => {
    if (!selectedOrder) return;
    const paidNum = amountPaid === '' ? total : Number(amountPaid);

    if (paymentMethod === 'EFECTIVO' && paidNum < total) {
      alert(`El monto en efectivo ingresado ($${paidNum}) es menor al total a pagar ($${total}).`);
      return;
    }

    const ticketFolio = `TICK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const changeCalc = paymentMethod === 'EFECTIVO' ? Math.max(0, paidNum - total) : 0;
    const cashier = user?.full_name ? user.full_name.split(' (')[0] : 'Cajero 1';

    // 1. Marcar la orden como pagada
    markOrderAsPaid(selectedOrder.id, {
      cashierName: cashier,
      paymentMethod,
      amountPaid: paidNum,
      changeGiven: changeCalc,
      ticketFolio,
    });

    // 2. Guardar en el almacén de tickets para auto-facturación
    const newTicket: CounterTicket = {
      folio: ticketFolio,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      branchName: selectedOrder.branchName,
      cashierName: cashier,
      customerName: selectedOrder.customerName,
      paymentMethod,
      items: selectedOrder.items.map((it) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal,
      })),
      subtotal: selectedOrder.subtotal,
      iva: selectedOrder.iva,
      total: selectedOrder.total,
      amountPaid: paidNum,
      changeGiven: changeCalc,
      isBilled: false,
    };

    saveCounterTicket(newTicket);
    setCompletedTicket(newTicket);
    loadOrders();
  };

  // Métricas rápidas de caja hoy
  const totalCobradoHoy = orders
    .filter((o) => o.status === 'PAGADO')
    .reduce((sum, o) => sum + o.total, 0);

  const pendientesCount = orders.filter((o) => o.status === 'PENDIENTE_PAGO').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera */}
      <PageHeader
        icon={Receipt}
        title="Caja de Cobro (Terminal Cajero)"
        subtitle="Módulo 2: Recepción y cobro de órdenes generadas por los vendedores en mostrador, emisión de tickets y cambio."
      />

      {/* Tarjetas KPI de Caja */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Órdenes en Espera (Fila)</span>
            <span className="text-2xl font-black text-amber-600 block mt-1">{pendientesCount}</span>
            <span className="text-[10px] text-slate-400">Por cobrar en ventanilla</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Cobrado en Turno</span>
            <span className="text-2xl font-black text-emerald-600 block mt-1">
              ${totalCobradoHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400">Ventas en caja hoy</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Cajero en Turno</span>
            <span className="text-base font-black text-slate-900 block mt-1 truncate max-w-[180px]">
              {user?.full_name ? user.full_name.split(' (')[0] : 'Cajero 1'}
            </span>
            <span className="text-[10px] text-slate-400">{user?.branch?.name || 'Matriz Centro'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#580f36]/10 text-[#580f36] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Contenedor Principal (2 Columnas: Fila de Órdenes vs Terminal de Cobro) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* COLUMNA IZQUIERDA: FILA DE ÓRDENES EN CAJA (5 COLS)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            {/* Buscador de Folio / Escáner */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Escanear o teclear Folio (ej. ORD-2026-1011)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-[#580f36] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Buscar
              </button>
            </form>

            {/* Filtros de Pestañas */}
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
              {(['PENDIENTES', 'COBRADAS', 'TODAS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
                    statusFilter === tab ? 'bg-white text-[#580f36] shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  {tab === 'PENDIENTES'
                    ? `En Fila (${pendientesCount})`
                    : tab === 'COBRADAS'
                    ? 'Cobradas'
                    : 'Todas'}
                </button>
              ))}
            </div>

            {/* Lista de Órdenes */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pt-1">
              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No hay órdenes en este estado.
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const isPaid = ord.status === 'PAGADO';

                  return (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-[#580f36] bg-pink-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-[#580f36]">
                          {ord.folio}
                        </span>
                        <span className="font-black text-sm text-slate-900">
                          ${ord.total.toFixed(2)} MXN
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate max-w-[180px]">
                          {ord.customerName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {isPaid ? 'Cobrado' : 'Esperando Pago'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Vendedor: {ord.sellerName}</span>
                        <span>{ord.createdAt.split(' ')[1]}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMNA DERECHA: PANTALLA DE COBRO EN CAJA (7 COLS)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {selectedOrder ? (
            <div>
              {/* Cabecera de la Orden Seleccionada */}
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xl text-[#580f36]">
                      {selectedOrder.folio}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        selectedOrder.status === 'PAGADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedOrder.status === 'PAGADO' ? 'Orden Pagada' : 'Pendiente de Pago'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Cliente: <strong className="text-slate-900">{selectedOrder.customerName}</strong> • Atendido por: {selectedOrder.sellerName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Importe a Cobrar</span>
                  <span className="text-2xl font-black text-[#580f36]">
                    ${selectedOrder.total.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="p-5 space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Artículos Despachados por Mostrador ({selectedOrder.items.length}):
                </span>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Insumo</th>
                        <th className="py-2 px-3 text-center">Cant</th>
                        <th className="py-2 px-3 text-right">P. Unit</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{it.sku}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{it.name}</td>
                          <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                          <td className="py-2 px-3 text-right text-slate-600">${it.price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-black text-slate-900">${it.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Desglose de Impuestos */}
                <div className="flex justify-end pt-1">
                  <div className="w-60 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-slate-800">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>IVA Trasladado (16%):</span>
                      <span className="font-semibold text-slate-800">${selectedOrder.iva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Total:</span>
                      <span className="text-[#580f36] text-base">${selectedOrder.total.toFixed(2)} MXN</span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* SECCIÓN DE COBRO (SI NO HA SIDO PAGADA)                 */}
                {/* ======================================================== */}
                {selectedOrder.status === 'PENDIENTE_PAGO' ? (
                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                      Selecciona Forma de Pago:
                    </span>

                    {/* Botones Métodos de Pago */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod('EFECTIVO')}
                        className={`py-3 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'EFECTIVO'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>Efectivo</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('TARJETA')}
                        className={`py-3 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'TARJETA'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Tarjeta TPV</span>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('TRANSFERENCIA')}
                        className={`py-3 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          paymentMethod === 'TRANSFERENCIA'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>Transferencia SPEI</span>
                      </button>
                    </div>

                    {/* Calculadora en Efectivo */}
                    {paymentMethod === 'EFECTIVO' && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                              Efectivo Recibido del Cliente ($):
                            </label>
                            <input
                              type="number"
                              placeholder={`$${total}`}
                              value={amountPaid}
                              onChange={(e) =>
                                setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))
                              }
                              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                              Cambio a Entregar:
                            </label>
                            <div className="w-full p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-sm font-mono font-black text-right">
                              ${changeDue.toFixed(2)} MXN
                            </div>
                          </div>
                        </div>

                        {/* Botones de billetes rápidos */}
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-bold text-slate-400">Atajos:</span>
                          <button
                            type="button"
                            onClick={() => setAmountPaid(total)}
                            className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 cursor-pointer"
                          >
                            Importe Exacto
                          </button>
                          {[100, 200, 500, 1000].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setAmountPaid(b)}
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-bold text-slate-700 cursor-pointer"
                            >
                              ${b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botón Acción Cobrar */}
                    <button
                      onClick={handleProcessPayment}
                      className="w-full py-3.5 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-sm font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Cobrar ${total.toFixed(2)} MXN y Expedir Ticket</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold block">Esta orden ya fue cobrada en caja.</span>
                        <span className="text-[11px] text-emerald-700">
                          Ticket: <strong>{selectedOrder.ticketFolio}</strong> • Cobrado el {selectedOrder.paidAt} por {selectedOrder.cashierName}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 p-6 flex flex-col items-center justify-center">
              <Receipt className="w-12 h-12 text-slate-200 mb-2 stroke-1" />
              <p className="text-sm font-bold text-slate-600">Selecciona una orden de la lista para cobrar</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Cuando el cliente llegue a caja con su folio de mostrador, búscalo o elígelo en la columna izquierda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Ticket de Cobro Exitoso listo para imprimir */}
      {completedTicket && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setCompletedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón X de Salir / Cerrar Visualizador */}
            <button
              type="button"
              onClick={() => setCompletedTicket(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-2xs z-10"
              title="Cerrar ticket (X)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">LAVACLEAN PRO</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{completedTicket.branchName}</p>
              <div className="bg-pink-50 text-[#580f36] p-1.5 rounded-lg border border-pink-200 font-mono font-black text-sm my-1">
                {completedTicket.folio}
              </div>
              <p className="text-[10px] text-slate-400">{completedTicket.date}</p>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Cliente:</span>
                <span className="font-bold text-slate-800">{completedTicket.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Cajero:</span>
                <span>{completedTicket.cashierName}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Forma de Pago:</span>
                <span className="font-bold">{completedTicket.paymentMethod}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-200 py-2.5 my-2 space-y-1.5 text-xs max-h-40 overflow-y-auto">
              {completedTicket.items.map((it, idx) => (
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
                <span>${completedTicket.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>IVA (16%):</span>
                <span>${completedTicket.iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t">
                <span>Total Pagado:</span>
                <span className="text-[#580f36]">${completedTicket.total.toFixed(2)} MXN</span>
              </div>
              {completedTicket.paymentMethod === 'EFECTIVO' && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Cambio Entregado:</span>
                  <span className="font-bold text-emerald-700">${completedTicket.changeGiven.toFixed(2)} MXN</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 text-center space-y-1">
              <span className="text-[10px] font-black text-[#580f36] uppercase tracking-wider block">
                Facturación en Línea SAT 4.0
              </span>
              <p className="text-[10px] text-slate-600 leading-tight">
                El cliente puede facturar este ticket en:
              </p>
              <Link
                to="/facturacion"
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#580f36] hover:underline"
              >
                <span>lavacleanpro.com/facturacion</span>
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
                onClick={() => setCompletedTicket(null)}
                className="py-2.5 px-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Cobrar Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

