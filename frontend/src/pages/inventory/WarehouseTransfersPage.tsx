import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ErpModal } from '../../components/common/ErpModal';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  WarehouseTransfer,
  INITIAL_TRANSFERS,
  WAREHOUSES,
  canViewAllWarehouses,
  getAssignedWarehouseForRole,
} from '../../data/warehouseData';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Truck,
  Eye,
  Trash2,
  ShieldAlert,
  Boxes,
  MapPin,
  TrendingDown,
  Repeat,
  FileText,
} from 'lucide-react';

const DEFAULT_TRANSFER_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio Movimiento', visible: true, required: true },
  { id: 'type', label: 'Tipo de Salida', visible: true },
  { id: 'source', label: 'Almacén Origen', visible: true },
  { id: 'target', label: 'Almacén Destino', visible: true },
  { id: 'date', label: 'Fecha / Hora', visible: true },
  { id: 'items', label: 'Artículos Transferidos', visible: true, required: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const WarehouseTransfersPage: React.FC = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>(INITIAL_TRANSFERS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('TODOS');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_TRANSFER_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Control de Almacén asignado
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

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState<WarehouseTransfer | null>(null);

  // Formulario Nuevo Traspaso / Salida
  const [formType, setFormType] = useState<'TRASPASO_SUCURSAL' | 'MERMA_DESECHO'>('TRASPASO_SUCURSAL');
  const [formSourceWarehouse, setFormSourceWarehouse] = useState(
    userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse
  );
  const [formTargetWarehouse, setFormTargetWarehouse] = useState('Sucursal Centro');
  const [formCarrier, setFormCarrier] = useState('Camioneta Reparto Interno #03 (Chofer: Pedro Martínez)');
  const [formNotes, setFormNotes] = useState('Resurtido prioritario de insumos para mostrador.');
  const [formItemSku, setFormItemSku] = useState('LAV-DET-01');
  const [formItemName, setFormItemName] = useState('Detergente Enzimático Industrial 20L');
  const [formQty, setFormQty] = useState(10);

  // Filtrado
  const filtered = transfers.filter((t) => {
    const term = search.toLowerCase();
    const matchesSearch =
      t.folio.toLowerCase().includes(term) ||
      t.source_warehouse.toLowerCase().includes(term) ||
      (t.target_warehouse && t.target_warehouse.toLowerCase().includes(term)) ||
      t.requested_by.toLowerCase().includes(term);

    const matchesType = typeFilter === 'TODOS' || t.transfer_type === typeFilter;

    // Regla de Visibilidad:
    // CEDIS ve todo.
    // Almacenista de sucursal solo ve traspasos donde su sucursal sea origen o destino.
    const matchesWarehouse =
      selectedWarehouse === 'TODOS' ||
      t.source_warehouse === selectedWarehouse ||
      t.target_warehouse === selectedWarehouse;

    return matchesSearch && matchesType && matchesWarehouse;
  });

  // KPIs
  const totalTransfers = filtered.length;
  const inTransitCount = filtered.filter((t) => t.status === 'EN_TRANSITO').length;
  const completedCount = filtered.filter((t) => t.status === 'RECIBIDO_EN_DESTINO').length;
  const mermaCount = filtered.filter((t) => t.transfer_type === 'MERMA_DESECHO').length;

  const handleOpenCreate = () => {
    setFormType('TRASPASO_SUCURSAL');
    setFormSourceWarehouse(userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse);
    setFormTargetWarehouse(
      userDefaultWarehouse === 'Sucursal Centro' ? 'Sucursal Norte (Módulo Plaza)' : 'Sucursal Centro'
    );
    setFormCarrier('Camioneta Reparto Interno #03 (Chofer: Pedro Martínez)');
    setFormNotes('Resurtido rutinario de stock entre almacenes.');
    setFormItemSku('LAV-DET-01');
    setFormItemName('Detergente Enzimático Industrial 20L');
    setFormQty(10);
    setShowModal(true);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (formQty <= 0) {
      alert('La cantidad a transferir o dar de baja debe ser mayor a 0.');
      return;
    }

    if (formType === 'TRASPASO_SUCURSAL' && formSourceWarehouse === formTargetWarehouse) {
      alert('El almacén de origen y destino no pueden ser el mismo.');
      return;
    }

    const isMerma = formType === 'MERMA_DESECHO';
    const nextFolio = isMerma
      ? `MERMA-2026-${String(transfers.length + 15).padStart(4, '0')}`
      : `TRASP-2026-${String(transfers.length + 20).padStart(4, '0')}`;

    const newTransfer: WarehouseTransfer = {
      id: `trasp-${Date.now()}`,
      folio: nextFolio,
      transfer_type: formType,
      source_warehouse: formSourceWarehouse,
      target_warehouse: isMerma ? undefined : formTargetWarehouse,
      requested_by: user?.full_name || 'Almacenista en Turno',
      authorized_by: userCanViewAll ? 'Ing. Fernando (CEDIS Central)' : 'Gerente de Sucursal',
      carrier_name: isMerma ? undefined : formCarrier,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: isMerma ? 'BAJA_APROBADA' : 'EN_TRANSITO',
      notes: formNotes.trim() || undefined,
      items: [
        {
          sku: formItemSku,
          product_name: formItemName,
          quantity: Number(formQty),
          unit: 'Uds',
          cost: 350.0,
        },
      ],
    };

    setTransfers([newTransfer, ...transfers]);

    if (isMerma) {
      alert(`✅ Salida por Merma ${nextFolio} registrada. -${formQty} uds retiradas de "${formSourceWarehouse}".`);
    } else {
      alert(
        `✅ Traspaso ${nextFolio} generado con éxito en ruta hacia "${formTargetWarehouse}".\nStock en tránsito actualizado.`
      );
    }

    setShowModal(false);
  };

  const handleConfirmReceipt = (id: string, folio: string) => {
    if (confirm(`¿Confirmas la recepción física completa del traspaso ${folio} en tu almacén?`)) {
      setTransfers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'RECIBIDO_EN_DESTINO' } : t))
      );
      alert(`✅ Traspaso ${folio} marcado como RECIBIDO EN DESTINO. Existencias añadidas a inventario local.`);
    }
  };

  return (
    <div className="saas-container">
      {/* 1. Header Ejecutivo */}
      <PageHeader
        title="Salidas & Traspasos entre Almacenes"
        subtitle="Control logístico de envíos entre CEDIS y sucursales, así como autorización formal de mermas y bajas"
        icon={ArrowLeftRight}
        actions={
          <button onClick={handleOpenCreate} className="btn-primary-wine">
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nuevo Traspaso o Salida</span>
          </button>
        }
      />

      {/* 2. Banner de Filtro de Almacén (Regla CEDIS vs Sucursal) */}
      {!userCanViewAll && (
        <div className="mb-6 p-3 bg-pink-50 border border-pink-200/80 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#580f36]" />
            <div>
              <span className="text-xs font-bold text-[#580f36]">
                Almacén Asignado: {userDefaultWarehouse}
              </span>
              <p className="text-[11px] text-pink-900/70">
                Solo visualizas los traspasos enviados o recibidos por tu sucursal asignada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Movimientos Logísticos"
          value={totalTransfers}
          change="Traspasos y bajas"
          icon={Repeat}
          color="wine"
        />
        <KpiCard
          label="En Tránsito a Sucursal"
          value={inTransitCount}
          change="En ruta de entrega"
          icon={Truck}
          color="blue"
        />
        <KpiCard
          label="Traspasos Completados"
          value={completedCount}
          change="Recibidos en destino"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          label="Mermas / Bajas"
          value={mermaCount}
          change="Desecho por daño/uso"
          icon={TrendingDown}
          color="amber"
        />
      </div>

      {/* 4. Barra de Búsqueda y Selector de Almacén */}
      <div className="saas-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Folio, Almacén origen/destino o Responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input pl-9 text-xs"
            />
          </div>

          <div className="w-full lg:w-72 relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              disabled={!userCanViewAll}
              className={`saas-select pl-9 text-xs ${
                !userCanViewAll ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-80' : ''
              }`}
            >
              {userCanViewAll && (
                <option value="TODOS">Todos los Almacenes (Consolidado General)</option>
              )}
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name} {w.type === 'CEDIS' ? '(CEDIS Central)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-56">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="saas-select text-xs"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="TRASPASO_SUCURSAL">Solo Traspasos entre Sucursales</option>
              <option value="MERMA_DESECHO">Solo Mermas & Bajas</option>
            </select>
          </div>

          <ColumnVisibilityDropdown
            columns={columns}
            onChange={handleColumnChange}
            onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
            onReset={() => setColumns(DEFAULT_TRANSFER_COLUMNS)}
          />
        </div>
      </div>

      {/* 5. Tabla de Traspasos y Salidas */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                {isColVisible('folio') && <th className="saas-th w-36 whitespace-nowrap">Folio Movimiento</th>}
                {isColVisible('type') && <th className="saas-th text-center w-36 whitespace-nowrap">Tipo de Salida</th>}
                {isColVisible('source') && <th className="saas-th min-w-[180px] whitespace-nowrap">Almacén Origen</th>}
                {isColVisible('target') && <th className="saas-th min-w-[180px] whitespace-nowrap">Almacén Destino</th>}
                {isColVisible('date') && <th className="saas-th text-center w-36 whitespace-nowrap">Fecha / Hora</th>}
                {isColVisible('items') && <th className="saas-th min-w-[200px]">Artículos Transferidos</th>}
                {isColVisible('status') && <th className="saas-th text-center w-36 whitespace-nowrap">Estado</th>}
                {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acciones</th>}
              </tr>
            </thead>
            <tbody className="saas-tbody">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length || 1} className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron traspasos o salidas para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    {/* Folio */}
                    {isColVisible('folio') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded">
                          {t.folio}
                        </span>
                      </td>
                    )}

                    {/* Tipo */}
                    {isColVisible('type') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            t.transfer_type === 'TRASPASO_SUCURSAL'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {t.transfer_type === 'TRASPASO_SUCURSAL' ? 'TRASPASO SUCURSAL' : 'MERMA / DESECHO'}
                        </span>
                      </td>
                    )}

                    {/* Origen */}
                    {isColVisible('source') && (
                      <td className="saas-td normal-case">
                        <span className="text-xs font-semibold text-slate-900 block leading-snug">
                          {t.source_warehouse}
                        </span>
                        <span className="text-[10px] text-slate-400">Solicitó: {t.requested_by}</span>
                      </td>
                    )}

                    {/* Destino */}
                    {isColVisible('target') && (
                      <td className="saas-td normal-case">
                        {t.target_warehouse ? (
                          <span className="text-xs font-semibold text-slate-900 block leading-snug">
                            {t.target_warehouse}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block">
                            Baja Definitiva
                          </span>
                        )}
                        {t.carrier_name && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[160px]" title={t.carrier_name}>
                            {t.carrier_name}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Fecha */}
                    {isColVisible('date') && (
                      <td className="saas-td text-center text-slate-500 text-xs font-mono whitespace-nowrap">
                        {t.date}
                      </td>
                    )}

                    {/* Artículos */}
                    {isColVisible('items') && (
                      <td className="saas-td normal-case">
                        {t.items.map((it, idx) => (
                          <div key={idx} className="text-xs leading-snug">
                            <strong className="text-slate-900 font-mono">{it.quantity} {it.unit}</strong> • {it.product_name}
                          </div>
                        ))}
                      </td>
                    )}

                    {/* Estado */}
                    {isColVisible('status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            t.status === 'RECIBIDO_EN_DESTINO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.status === 'EN_TRANSITO'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {t.status === 'RECIBIDO_EN_DESTINO'
                            ? 'RECIBIDO EN DESTINO'
                            : t.status === 'EN_TRANSITO'
                            ? 'EN TRÁNSITO'
                            : 'BAJA APROBADA'}
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.status === 'EN_TRANSITO' && (
                            <button
                              onClick={() => handleConfirmReceipt(t.id, t.folio)}
                              className="action-btn action-btn-green"
                              title="Confirmar recepción física en destino"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingTransfer(t)}
                            className="action-btn action-btn-view"
                            title="Ver detalle del traspaso"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {transfers.length} movimientos de traspaso</span>
          <span className="text-slate-500 font-medium">
            El Almacén Central CEDIS abastece a todas las sucursales con trazabilidad de transporte
          </span>
        </div>
      </div>

      {/* 6. Modal: Nuevo Traspaso o Merma */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={formType === 'TRASPASO_SUCURSAL' ? 'Nuevo Traspaso entre Almacenes' : 'Registro de Salida por Merma'}
        breadcrumb={['Inicio', 'Almacén', 'Salidas & Traspasos', 'Nuevo']}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-executive-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveTransfer}
              className="btn-executive-wine"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Descontar de Origen</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setFormType('TRASPASO_SUCURSAL')}
              className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                formType === 'TRASPASO_SUCURSAL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Traspaso a Otra Sucursal
            </button>
            <button
              type="button"
              onClick={() => setFormType('MERMA_DESECHO')}
              className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                formType === 'MERMA_DESECHO'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Salida por Merma / Daño
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Almacén Origen */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Almacén Origen (Resta Stock)
              </label>
              <select
                value={formSourceWarehouse}
                onChange={(e) => setFormSourceWarehouse(e.target.value)}
                disabled={!userCanViewAll}
                className={`saas-select text-xs ${
                  !userCanViewAll ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Almacén Destino (Solo si es traspaso) */}
            {formType === 'TRASPASO_SUCURSAL' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Almacén Destino (Suma Stock)
                </label>
                <select
                  value={formTargetWarehouse}
                  onChange={(e) => setFormTargetWarehouse(e.target.value)}
                  className="saas-select text-xs font-bold text-[#580f36]"
                >
                  {WAREHOUSES.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">
                  Concepto de Salida
                </label>
                <select className="saas-select text-xs text-rose-700 font-bold bg-rose-50/50">
                  <option>Merma por Envase Dañado o Fisurado</option>
                  <option>Evaporación / Desperdicio Químico</option>
                  <option>Consumo Interno en Planchaduría</option>
                  <option>Desecho de Insumo Caduco</option>
                </select>
              </div>
            )}

            {/* Insumo a Transferir */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Insumo / Producto a Transferir
              </label>
              <select
                value={formItemSku}
                onChange={(e) => {
                  setFormItemSku(e.target.value);
                  if (e.target.value === 'LAV-DET-01') setFormItemName('Detergente Enzimático Industrial 20L');
                  if (e.target.value === 'LAV-SUAV-02') setFormItemName('Suavizante Textil Concentrado Aroma Lavanda 20L');
                  if (e.target.value === 'EMP-GAN-04') setFormItemName('Caja de Ganchos Metálicos Galvanizados');
                  if (e.target.value === 'EMP-POL-05') setFormItemName('Rollo Polietileno Tubular Transparente');
                }}
                className="saas-select text-xs font-bold"
              >
                <option value="LAV-DET-01">LAV-DET-01 | Detergente Enzimático 20L</option>
                <option value="LAV-SUAV-02">LAV-SUAV-02 | Suavizante Lavanda 20L</option>
                <option value="EMP-GAN-04">EMP-GAN-04 | Ganchos Galvanizados (500 pzas)</option>
                <option value="EMP-POL-05">EMP-POL-05 | Polietileno Tubular 1000m</option>
              </select>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad a Transferir / Sacar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formQty}
                onChange={(e) => setFormQty(Number(e.target.value))}
                className="saas-input text-xs font-bold text-center"
              />
            </div>

            {/* Transporte (Solo si es traspaso) */}
            {formType === 'TRASPASO_SUCURSAL' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Unidad de Transporte / Chofer Encargado
                </label>
                <input
                  type="text"
                  value={formCarrier}
                  onChange={(e) => setFormCarrier(e.target.value)}
                  className="saas-input text-xs"
                  placeholder="Ej. Camioneta #03 (Chofer: Pedro Martínez)"
                />
              </div>
            )}

            {/* Justificación */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Justificación / Notas del Movimiento
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="saas-input text-xs"
                placeholder="Indica motivo del resurtido o detalle de la merma física..."
              />
            </div>
          </div>
        </form>
      </ErpModal>

      {/* 7. Modal Detalle de Traspaso */}
      {viewingTransfer && (
        <ErpModal
          isOpen={true}
          onClose={() => setViewingTransfer(null)}
          title={`Detalle de Movimiento: ${viewingTransfer.folio}`}
          breadcrumb={['Inicio', 'Almacén', 'Traspasos', viewingTransfer.folio]}
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setViewingTransfer(null)}
              className="btn-executive-wine"
            >
              Cerrar Detalle
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-400 text-[10px] block">Folio:</span>
                <span className="font-bold font-mono text-[#580f36] text-sm">{viewingTransfer.folio}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Tipo:</span>
                <span className="font-bold text-slate-900">{viewingTransfer.transfer_type}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Almacén Origen:</span>
                <span className="font-bold text-slate-900">{viewingTransfer.source_warehouse}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Almacén Destino:</span>
                <span className="font-bold text-slate-900">{viewingTransfer.target_warehouse || 'N/A (Baja Definitiva)'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Fecha y Hora:</span>
                <span className="font-mono text-slate-800">{viewingTransfer.date}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Estatus:</span>
                <span className="font-bold text-emerald-700">{viewingTransfer.status}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 min-w-[200px] border-r border-slate-200">Insumo</th>
                    <th className="p-2.5 text-center w-28 border-r border-slate-200">Cantidad</th>
                    <th className="p-2.5 text-right w-28">Costo Unit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingTransfer.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100">{it.product_name} ({it.sku})</td>
                      <td className="p-2.5 text-center font-bold text-slate-900 border-r border-slate-100">{it.quantity} {it.unit}</td>
                      <td className="p-2.5 text-right font-mono">${it.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewingTransfer.notes && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700">
                <strong>Justificación:</strong> {viewingTransfer.notes}
              </div>
            )}
          </div>
        </ErpModal>
      )}
    </div>
  );
};
