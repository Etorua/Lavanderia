import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Quotation } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ErpModal } from '../../components/common/ErpModal';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  getStoredQuotations,
  saveStoredQuotations,
  releaseReservation,
  extendReservation,
} from '../../data/quotationsData';
import { saveStoredCounterOrder, CounterOrder } from '../../data/counterSalesData';
import {
  Clock,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Unlock,
  RotateCcw,
  FileText,
  DollarSign,
  Package,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const DEFAULT_RESERVATIONS_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio Reserva', visible: true, required: true },
  { id: 'client', label: 'Cliente / Razón Social', visible: true, required: true },
  { id: 'items', label: 'Insumos Apartados', visible: false },
  { id: 'total', label: 'Total Apartado', visible: true },
  { id: 'time_remaining', label: 'Vigencia (48h)', visible: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acción Vendedor / Caja', visible: true, required: true },
];

export const ReservationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(getStoredQuotations());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'ACTIVAS' | 'POR_VENCER' | 'CONVERTIDAS' | 'EXPIRADAS'>('ACTIVAS');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Column Visibility
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_RESERVATIONS_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  const { addItem, clearCart } = useCart();
  const navigate = useNavigate();

  // Escuchar cambios globales en cotizaciones y reservas
  useEffect(() => {
    const handleSync = () => {
      setQuotations(getStoredQuotations());
    };
    window.addEventListener('quotations_updated', handleSync);
    return () => window.removeEventListener('quotations_updated', handleSync);
  }, []);

  // Calcular tiempo restante de la reserva de 48h
  const getTimeRemainingInfo = (q: Quotation) => {
    if (!q.reservation_expires_at) {
      return { hoursLeft: 0, text: 'Sin vigencia', isExpired: true, isUrgent: false };
    }
    const expires = new Date(q.reservation_expires_at).getTime();
    const diffMs = expires - Date.now();
    if (diffMs <= 0) {
      return { hoursLeft: 0, text: 'Vigencia 48h expirada', isExpired: true, isUrgent: false };
    }
    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return {
      hoursLeft: hours,
      text: `${hours}h ${mins}m restantes`,
      isExpired: false,
      isUrgent: hours <= 12,
    };
  };

  // Filtrar reservas
  const reservationsList = quotations.filter((q) => q.reserves_stock || q.status === 'RESERVADA' || q.status === 'CONVERTIDA');

  const filtered = reservationsList.filter((q) => {
    const term = search.toLowerCase();
    const matchesSearch =
      q.folio.toLowerCase().includes(term) ||
      q.client_name.toLowerCase().includes(term) ||
      (q.client_rfc && q.client_rfc.toLowerCase().includes(term)) ||
      (q.client_contact && q.client_contact.toLowerCase().includes(term));

    const timeInfo = getTimeRemainingInfo(q);

    let matchesStatus = true;
    if (statusFilter === 'ACTIVAS') {
      matchesStatus = q.status === 'RESERVADA' && !timeInfo.isExpired;
    } else if (statusFilter === 'POR_VENCER') {
      matchesStatus = q.status === 'RESERVADA' && timeInfo.isUrgent && !timeInfo.isExpired;
    } else if (statusFilter === 'CONVERTIDAS') {
      matchesStatus = q.status === 'CONVERTIDA';
    } else if (statusFilter === 'EXPIRADAS') {
      matchesStatus = q.status === 'RESERVADA' && timeInfo.isExpired;
    }

    return matchesSearch && matchesStatus;
  });

  // Jalar reserva a la Caja de Cobro
  const handlePullToPOS = (q: Quotation) => {
    clearCart();
    q.items.forEach((item) => {
      addItem(item.product, item.quantity);
    });

    // Crear orden en la cola de Caja de Cobro
    const subtotal = Number((q.total / 1.16).toFixed(2));
    const iva = Number((q.total - subtotal).toFixed(2));
    const orderFromRes: CounterOrder = {
      id: `ord-res-${Date.now()}`,
      folio: `ORD-${q.folio.replace('COT-', '')}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sellerName: 'Apartados Mostrador (Reserva)',
      customerName: q.client_name,
      branchName: 'Sucursal Matriz Centro',
      items: q.items.map((it) => ({
        id: it.product.id,
        sku: it.product.sku,
        name: it.product.name,
        quantity: it.quantity,
        price: it.unit_price,
        subtotal: it.subtotal,
      })),
      subtotal,
      iva,
      total: q.total,
      status: 'PENDIENTE_PAGO',
    };
    saveStoredCounterOrder(orderFromRes);

    const updated = quotations.map((item) =>
      item.id === q.id ? { ...item, status: 'CONVERTIDA' as const } : item
    );
    saveStoredQuotations(updated);

    alert(`🛒 ¡Reserva ${q.folio} enviada a Caja de Cobro!\n\nCliente: ${q.client_name}\nSe generó la orden ${orderFromRes.folio} en ventanilla de caja.`);
    navigate('/admin/cashier');
  };

  // Liberar el stock reservado
  const handleRelease = (id: string, folio: string) => {
    if (confirm(`¿Liberar el apartado de la cotización ${folio}?\nEl stock bloqueado volverá a estar disponible de inmediato para otros clientes.`)) {
      const res = releaseReservation(id);
      if (res.success) {
        setQuotations(getStoredQuotations());
        alert(res.message);
      }
    }
  };

  // Extender 24 horas adicionales
  const handleExtend = (id: string) => {
    const res = extendReservation(id, 24);
    if (res.success) {
      setQuotations(getStoredQuotations());
      alert(res.message);
    }
  };

  // Métricas
  const activeCount = quotations.filter((q) => q.status === 'RESERVADA' && !getTimeRemainingInfo(q).isExpired).length;
  const urgentCount = quotations.filter((q) => q.status === 'RESERVADA' && getTimeRemainingInfo(q).isUrgent).length;
  const totalValueApartado = quotations
    .filter((q) => q.status === 'RESERVADA' && !getTimeRemainingInfo(q).isExpired)
    .reduce((acc, curr) => acc + curr.total, 0);
  const convertedCount = quotations.filter((q) => q.status === 'CONVERTIDA').length;

  return (
    <div className="saas-container">
      {/* 1. Header Ejecutivo */}
      <PageHeader
        title="Reservas de Insumos & Apartados (48h)"
        subtitle="Administración de mercancía apartada con candado físico. Despacho y cobro directo para vendedores en Terminal POS."
        icon={Clock}
        actions={
          <Link
            to="/admin/quotations"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-[#580f36]" />
            <span>Ir al Módulo de Cotizaciones &rarr;</span>
          </Link>
        }
      />

      {/* 2. KPIs de Reservas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Reservas Activas (48h)"
          value={activeCount}
          change="Stock físico bloqueado"
          icon={Clock}
          color="amber"
        />
        <KpiCard
          label="Valor Total Apartado"
          value={`$${totalValueApartado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          change="Insumos comprometidos"
          icon={DollarSign}
          color="wine"
        />
        <KpiCard
          label="Por Vencer (<12h)"
          value={urgentCount}
          change="Prioridad de contacto"
          icon={AlertTriangle}
          color="amber"
        />
        <KpiCard
          label="Despachadas en POS"
          value={convertedCount}
          change="Cobradas por vendedores"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="saas-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Folio, Cliente, RFC o Teléfono de contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input pl-9 text-xs"
            />
          </div>

          <div className="w-full lg:w-72">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="saas-select text-xs font-semibold"
            >
              <option value="ACTIVAS">Reservas Activas (Candado Vigente)</option>
              <option value="POR_VENCER">Por Vencer (&lt; 12 Horas Restantes)</option>
              <option value="CONVERTIDAS">Convertidas / Jaladas a Venta POS</option>
              <option value="EXPIRADAS">Vencidas (Expiraron 48h)</option>
              <option value="TODAS">Todas las Reservas Históricas</option>
            </select>
          </div>

          <ColumnVisibilityDropdown
            columns={columns}
            onChange={handleColumnChange}
            onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
            onReset={() => setColumns(DEFAULT_RESERVATIONS_COLUMNS)}
          />
        </div>
      </div>

      {/* 4. Tabla de Reservas */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                {isColVisible('folio') && <th className="saas-th w-36 whitespace-nowrap">Folio Reserva</th>}
                {isColVisible('client') && <th className="saas-th min-w-[260px]">Cliente / Razón Social</th>}
                {isColVisible('items') && <th className="saas-th min-w-[220px]">Insumos Apartados</th>}
                {isColVisible('total') && <th className="saas-th text-right w-36 whitespace-nowrap">Total Apartado</th>}
                {isColVisible('time_remaining') && <th className="saas-th text-center w-40 whitespace-nowrap">Vigencia (48h)</th>}
                {isColVisible('status') && <th className="saas-th text-center w-36 whitespace-nowrap">Estado</th>}
                {isColVisible('actions') && <th className="saas-th text-center w-36 whitespace-nowrap">Acción Vendedor / Caja</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                    No se encontraron reservas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const isConverted = q.status === 'CONVERTIDA';
                  const timeInfo = getTimeRemainingInfo(q);

                  return (
                    <tr key={q.id} className="saas-tr">
                      {/* Folio */}
                      {isColVisible('folio') && (
                        <td className="saas-td whitespace-nowrap">
                          <button
                            onClick={() => setSelectedQuotation(q)}
                            className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 hover:bg-pink-100 border border-pink-200/60 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                            title="Clic para ver detalle y partidas de la reserva"
                          >
                            {q.folio}
                          </button>
                        </td>
                      )}

                      {/* Cliente / Razón Social (No se aplasta el texto) */}
                      {isColVisible('client') && (
                        <td className="saas-td">
                          <div className="min-w-[260px] max-w-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                                {q.client_name.charAt(0).toUpperCase()}
                              </div>
                              {q.client_rfc && (
                                <span className="font-mono text-[10px] text-[#580f36] bg-pink-50 border border-pink-200/50 px-1.5 py-0.5 rounded font-bold shrink-0">
                                  {q.client_rfc}
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">{q.client_name}</p>
                            {q.client_contact && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{q.client_contact}</span>
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Artículos Apartados */}
                      {isColVisible('items') && (
                        <td className="saas-td">
                          <div className="space-y-0.5 min-w-[200px] max-w-xs">
                            {q.items.slice(0, 2).map((it) => (
                              <p key={it.id} className="text-slate-700 font-medium text-[11px] truncate">
                                <span className="font-bold text-slate-900">{it.quantity}x</span> {it.product.name}
                              </p>
                            ))}
                            {q.items.length > 2 && (
                              <p className="text-[10px] text-slate-400 font-semibold italic">
                                +{q.items.length - 2} partida(s) adicional(es)
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Total */}
                      {isColVisible('total') && (
                        <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                          ${q.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      )}

                      {/* Vigencia / Tiempo Restante de las 48h */}
                      {isColVisible('time_remaining') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          {isConverted ? (
                            <span className="text-emerald-700 font-bold text-xs">Venta Concretada</span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                                timeInfo.isExpired
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : timeInfo.isUrgent
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{timeInfo.text}</span>
                            </span>
                          )}
                        </td>
                      )}

                      {/* Estado */}
                      {isColVisible('status') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          <span
                            className={`saas-badge ${
                              isConverted
                                ? 'saas-badge-success'
                                : timeInfo.isExpired
                                ? 'saas-badge-danger'
                                : timeInfo.isUrgent
                                ? 'saas-badge-warning'
                                : 'saas-badge-warning'
                            }`}
                          >
                            {isConverted ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{isConverted ? 'COBRADA EN POS' : timeInfo.isExpired ? 'EXPIRADA' : 'RESERVADA (48H)'}</span>
                          </span>
                        </td>
                      )}

                      {/* Acción Vendedor / Caja (Jalar reserva) */}
                      {isColVisible('actions') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isConverted && (
                              <button
                                onClick={() => handlePullToPOS(q)}
                                className="action-btn-pill-primary"
                                title="Jalar esta reserva a Venta Directa de Mostrador para cobrar"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Cobrar en Mostrador</span>
                              </button>
                            )}

                            {!isConverted && (
                              <button
                                onClick={() => handleExtend(q.id)}
                                className="action-btn action-btn-amber"
                                title="Extender reserva +24 horas"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            {!isConverted && (
                              <button
                                onClick={() => handleRelease(q.id, q.folio)}
                                className="action-btn action-btn-delete"
                                title="Liberar stock apartado"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedQuotation(q)}
                              className="action-btn action-btn-view"
                              title="Ver detalle del apartado"
                            >
                              <Eye className="w-4 h-4" />
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
        </div>

        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {reservationsList.length} reservas registradas</span>
          <span className="text-slate-500 font-medium">
            El vendedor jala la reserva a POS y el stock físico se descuenta de forma definitiva al cobrar
          </span>
        </div>
      </div>

      {/* Modal: Detalle de la Reserva de Insumos */}
      {selectedQuotation && (
        <ErpModal
          isOpen={!!selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          title={`Detalle de Reserva: ${selectedQuotation.folio}`}
          breadcrumb={['Inicio', 'Reservas de Insumos', selectedQuotation.folio]}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Vigencia candado: {selectedQuotation.reservation_expires_at ? new Date(selectedQuotation.reservation_expires_at).toLocaleString('es-MX') : 'N/A'}
              </span>
              <div className="flex items-center gap-2">
                {selectedQuotation.status !== 'CONVERTIDA' && (
                  <button
                    onClick={() => {
                      const q = selectedQuotation;
                      setSelectedQuotation(null);
                      handlePullToPOS(q);
                    }}
                    className="btn-executive-wine py-2 px-4 text-xs inline-flex items-center gap-1.5"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Jalar Reserva a Caja POS</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Tarjeta Cliente */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-extrabold text-slate-900 text-sm">{selectedQuotation.client_name}</h4>
              <p className="text-slate-500 mt-0.5">RFC: {selectedQuotation.client_rfc || 'Público en General'} &bull; Contacto: {selectedQuotation.client_contact || 'Sin contacto'}</p>
              <p className="text-slate-500">{selectedQuotation.client_address}</p>
            </div>

            {/* Tabla de Partidas Apartadas */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="saas-table">
                <thead className="saas-thead">
                  <tr>
                    <th className="saas-th">SKU</th>
                    <th className="saas-th">Insumo Apartado</th>
                    <th className="saas-th text-center">Cantidad</th>
                    <th className="saas-th text-right">Precio Unitario</th>
                    <th className="saas-th text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((it) => (
                    <tr key={it.id} className="saas-tr">
                      <td className="saas-td font-mono font-bold text-slate-700">{it.product.sku}</td>
                      <td className="saas-td font-semibold text-slate-900">{it.product.name}</td>
                      <td className="saas-td text-center font-extrabold text-slate-900">{it.quantity} uds</td>
                      <td className="saas-td text-right font-mono">${it.unit_price.toFixed(2)}</td>
                      <td className="saas-td text-right font-mono font-bold text-slate-900">${it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-2 text-sm font-black text-slate-900">
              Total Presupuestado: ${selectedQuotation.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {selectedQuotation.currency || 'MXN'}
            </div>
          </div>
        </ErpModal>
      )}
    </div>
  );
};
