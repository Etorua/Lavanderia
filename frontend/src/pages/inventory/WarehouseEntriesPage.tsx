import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ErpModal } from '../../components/common/ErpModal';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  MaterialReception,
  INITIAL_RECEPTIONS,
  WAREHOUSES,
  canViewAllWarehouses,
  getAssignedWarehouseForRole,
} from '../../data/warehouseData';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  Truck,
  Eye,
  Trash2,
  ShieldAlert,
  Boxes,
  MapPin,
  ClipboardCheck,
} from 'lucide-react';

const DEFAULT_ENTRY_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio Recepción', visible: true, required: true },
  { id: 'po', label: 'Orden de Compra (PO)', visible: true },
  { id: 'supplier', label: 'Proveedor / Fabricante', visible: true, required: true },
  { id: 'warehouse', label: 'Almacén Destino', visible: true },
  { id: 'date', label: 'Fecha / Hora', visible: true },
  { id: 'items', label: 'Artículos Recibidos', visible: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acción', visible: true, required: true },
];

export const WarehouseEntriesPage: React.FC = () => {
  const { user } = useAuth();
  const [receptions, setReceptions] = useState<MaterialReception[]>(INITIAL_RECEPTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_ENTRY_COLUMNS);
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
  const [viewingReception, setViewingReception] = useState<MaterialReception | null>(null);

  // Formulario Nueva Recepción
  const [formPoNumber, setFormPoNumber] = useState('PO-2026-0020');
  const [formSupplier, setFormSupplier] = useState('Química Industrial & Detergentes de México S.A.');
  const [formTargetWarehouse, setFormTargetWarehouse] = useState(
    userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse
  );
  const [formCarrierGuide, setFormCarrierGuide] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItemSku, setFormItemSku] = useState('LAV-DET-01');
  const [formItemName, setFormItemName] = useState('Detergente Enzimático Industrial 20L (Biodegradable)');
  const [formOrderedQty, setFormOrderedQty] = useState(30);
  const [formReceivedQty, setFormReceivedQty] = useState(30);
  const [formCondition, setFormCondition] = useState<'BUEN_ESTADO' | 'DANADO' | 'MERMA_PARCIAL'>('BUEN_ESTADO');

  // Filtrado
  const filtered = receptions.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.reception_folio.toLowerCase().includes(term) ||
      r.po_number.toLowerCase().includes(term) ||
      r.supplier_name.toLowerCase().includes(term) ||
      r.receiver_user.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'TODOS' || r.status === statusFilter;

    // Restricción por Almacén / Sucursal
    const matchesWarehouse =
      selectedWarehouse === 'TODOS' || r.target_warehouse === selectedWarehouse;

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  // KPIs
  const totalReceptions = filtered.length;
  const totalCompleted = filtered.filter((r) => r.status === 'RECIBIDA_TOTAL').length;
  const totalPartial = filtered.filter((r) => r.status === 'RECIBIDA_PARCIAL').length;
  const totalItemsReceived = filtered.reduce(
    (acc, r) => acc + r.items.reduce((sum, it) => sum + it.received_qty, 0),
    0
  );

  const handleOpenCreate = () => {
    setFormPoNumber(`PO-2026-00${Math.floor(20 + Math.random() * 80)}`);
    setFormSupplier('Química Industrial & Detergentes de México S.A.');
    setFormTargetWarehouse(userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse);
    setFormCarrierGuide('');
    setFormNotes('');
    setFormItemSku('LAV-DET-01');
    setFormItemName('Detergente Enzimático Industrial 20L (Biodegradable)');
    setFormOrderedQty(30);
    setFormReceivedQty(30);
    setFormCondition('BUEN_ESTADO');
    setShowModal(true);
  };

  const handleSaveReception = (e: React.FormEvent) => {
    e.preventDefault();
    if (formReceivedQty <= 0) {
      alert('La cantidad recibida debe ser mayor a 0.');
      return;
    }

    const nextFolio = `REC-2026-${String(receptions.length + 48).padStart(4, '0')}`;
    const isPartial = formReceivedQty < formOrderedQty;

    const newRec: MaterialReception = {
      id: `rec-${Date.now()}`,
      reception_folio: nextFolio,
      po_number: formPoNumber.trim().toUpperCase(),
      supplier_name: formSupplier,
      target_warehouse: formTargetWarehouse,
      received_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      receiver_user: user?.full_name || 'Almacenista en Turno',
      status: isPartial ? 'RECIBIDA_PARCIAL' : 'RECIBIDA_TOTAL',
      carrier_guide: formCarrierGuide.trim() || undefined,
      notes: formNotes.trim() || undefined,
      items: [
        {
          sku: formItemSku,
          product_name: formItemName,
          ordered_qty: Number(formOrderedQty),
          received_qty: Number(formReceivedQty),
          unit: 'Uds',
          condition: formCondition,
        },
      ],
    };

    setReceptions([newRec, ...receptions]);
    alert(
      `✅ Entrada ${nextFolio} registrada exitosamente para la orden ${formPoNumber}.\n+${formReceivedQty} unidades ingresadas al stock físico de "${formTargetWarehouse}".`
    );
    setShowModal(false);
  };

  return (
    <div className="saas-container">
      {/* 1. Header Ejecutivo */}
      <PageHeader
        title="Entradas & Recepción de Mercancía"
        subtitle="Recepción física y cotejo de insumos vinculados a Órdenes de Compra (PO) e ingresos directos a almacén"
        icon={PackageCheck}
        actions={
          <button onClick={handleOpenCreate} className="btn-executive-wine">
            <Plus className="w-4 h-4" />
            <span>+ Nueva Recepción de Material</span>
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
                Tu perfil de almacén de sucursal tiene acceso exclusivo a las existencias y recepciones de tu sucursal asignada.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Recepciones Registradas"
          value={totalReceptions}
          change="Movimientos Kardex (+)"
          icon={ClipboardCheck}
          color="wine"
        />
        <KpiCard
          label="Recepción 100% Completa"
          value={totalCompleted}
          change="Conformes con PO"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          label="Recepciones Parciales"
          value={totalPartial}
          change="Saldo pendiente de entrega"
          icon={Clock}
          color="amber"
        />
        <KpiCard
          label="Piezas Ingresadas a Stock"
          value={`${totalItemsReceived} UDS`}
          change="Sumadas al inventario físico"
          icon={Boxes}
          color="blue"
        />
      </div>

      {/* 4. Barra de Filtros y Selector de Almacén */}
      <div className="saas-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Folio de recepción, PO, Proveedor o Almacenista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input pl-9 text-xs"
            />
          </div>

          {/* Selector de Almacén (Habilitado para CEDIS / Restringido para Sucursal) */}
          <div className="w-full lg:w-72 relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              disabled={!userCanViewAll}
              className={`saas-select pl-9 text-xs ${
                !userCanViewAll ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-80' : ''
              }`}
              title={!userCanViewAll ? 'Solo el CEDIS Central puede alternar entre almacenes' : 'Filtrar por almacén'}
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

          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="saas-select text-xs"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="RECIBIDA_TOTAL">Recibida Total (100%)</option>
              <option value="RECIBIDA_PARCIAL">Recibida Parcial</option>
              <option value="PENDIENTE_INSPECCION">Pendiente de Inspección</option>
            </select>
          </div>

          <ColumnVisibilityDropdown
            columns={columns}
            onChange={handleColumnChange}
            onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
            onReset={() => setColumns(DEFAULT_ENTRY_COLUMNS)}
          />
        </div>
      </div>

      {/* 5. Tabla de Recepciones de Mercancía */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                {isColVisible('folio') && <th className="saas-th w-36 whitespace-nowrap">Folio Recepción</th>}
                {isColVisible('po') && <th className="saas-th w-36 whitespace-nowrap">Orden de Compra (PO)</th>}
                {isColVisible('supplier') && <th className="saas-th min-w-[240px]">Proveedor / Fabricante</th>}
                {isColVisible('warehouse') && <th className="saas-th w-44 whitespace-nowrap">Almacén Destino</th>}
                {isColVisible('date') && <th className="saas-th text-center w-36 whitespace-nowrap">Fecha / Hora</th>}
                {isColVisible('items') && <th className="saas-th min-w-[200px]">Artículos Recibidos</th>}
                {isColVisible('status') && <th className="saas-th text-center w-32 whitespace-nowrap">Estado</th>}
                {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acción</th>}
              </tr>
            </thead>
            <tbody className="saas-tbody">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length || 1} className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron recepciones de mercancía con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    {/* Folio Recepción */}
                    {isColVisible('folio') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded">
                          {r.reception_folio}
                        </span>
                      </td>
                    )}

                    {/* PO Vinculada */}
                    {isColVisible('po') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded inline-flex items-center gap-1">
                          <FileText className="w-3 h-3 text-blue-500" />
                          {r.po_number}
                        </span>
                      </td>
                    )}

                    {/* Proveedor */}
                    {isColVisible('supplier') && (
                      <td className="saas-td normal-case">
                        <span className="font-bold text-slate-900 block text-xs leading-snug">
                          {r.supplier_name}
                        </span>
                        {r.carrier_guide && (
                          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                            Guía: {r.carrier_guide}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Almacén */}
                    {isColVisible('warehouse') && (
                      <td className="saas-td normal-case whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-800">
                          {r.target_warehouse}
                        </span>
                        <p className="text-[10px] text-slate-400">Receptor: {r.receiver_user}</p>
                      </td>
                    )}

                    {/* Fecha */}
                    {isColVisible('date') && (
                      <td className="saas-td text-center text-slate-500 text-xs font-mono whitespace-nowrap">
                        {r.received_at}
                      </td>
                    )}

                    {/* Artículos */}
                    {isColVisible('items') && (
                      <td className="saas-td normal-case">
                        {r.items.map((it, idx) => (
                          <div key={idx} className="text-xs leading-snug">
                            <strong className="text-emerald-700 font-mono">+{it.received_qty}</strong> / {it.ordered_qty} {it.unit} • {it.product_name}
                          </div>
                        ))}
                      </td>
                    )}

                    {/* Estado */}
                    {isColVisible('status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                            r.status === 'RECIBIDA_TOTAL'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {r.status === 'RECIBIDA_TOTAL' ? 'RECIBIDA 100%' : 'PARCIAL'}
                        </span>
                      </td>
                    )}

                    {/* Acciones: Puros Iconos */}
                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <button
                          onClick={() => setViewingReception(r)}
                          className="w-7 h-7 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer mx-auto"
                          title="Ver detalle del acuse de recepción"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {receptions.length} recepciones de almacén</span>
          <span className="text-slate-500 font-medium">
            Toda recepción suma stock real e inserta automáticamente movimiento en el Kardex
          </span>
        </div>
      </div>

      {/* 6. Modal: Nueva Recepción Vinculada a PO */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Recepción de Mercancía vinculada a Orden de Compra (PO)"
        breadcrumb={['Inicio', 'Almacén', 'Entradas', 'Nueva Recepción']}
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
              onClick={handleSaveReception}
              className="btn-executive-wine"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Ingreso a Almacén</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveReception} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              Ingresa los datos de la remisión y verifica las cantidades físicas reales recibidas en rampa para alimentar el Kardex.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Folio PO */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Orden de Compra (PO) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formPoNumber}
                onChange={(e) => setFormPoNumber(e.target.value.toUpperCase())}
                className="saas-input font-mono font-bold text-xs uppercase"
                placeholder="PO-2026-0018"
              />
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Proveedor / Fabricante
              </label>
              <input
                type="text"
                required
                value={formSupplier}
                onChange={(e) => setFormSupplier(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Almacén Destino */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Almacén Destino de Recepción
              </label>
              <select
                value={formTargetWarehouse}
                onChange={(e) => setFormTargetWarehouse(e.target.value)}
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

            {/* Guía Transportista */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Guía / Transporte
              </label>
              <input
                type="text"
                value={formCarrierGuide}
                onChange={(e) => setFormCarrierGuide(e.target.value)}
                className="saas-input text-xs"
                placeholder="Ej. TRES-GUERRAS-8890"
              />
            </div>

            {/* Insumo a Cotejar */}
            <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase block">
                Cotejo de Mercancía Física en Rampa
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Insumo / Producto
                  </label>
                  <select
                    value={formItemSku}
                    onChange={(e) => {
                      setFormItemSku(e.target.value);
                      if (e.target.value === 'LAV-DET-01') setFormItemName('Detergente Enzimático Industrial 20L');
                      if (e.target.value === 'TINT-SOLV-03') setFormItemName('Solvente Limpieza en Seco Percloroetileno 25L');
                      if (e.target.value === 'EMP-GAN-04') setFormItemName('Caja de Ganchos Metálicos Galvanizados');
                    }}
                    className="saas-select text-xs font-bold"
                  >
                    <option value="LAV-DET-01">LAV-DET-01 | Detergente Enzimático 20L</option>
                    <option value="TINT-SOLV-03">TINT-SOLV-03 | Solvente Percloroetileno 25L</option>
                    <option value="EMP-GAN-04">EMP-GAN-04 | Ganchos Metálicos (500 pzas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Cantidad Solicitada en PO
                  </label>
                  <input
                    type="number"
                    value={formOrderedQty}
                    onChange={(e) => setFormOrderedQty(Number(e.target.value))}
                    className="saas-input text-xs text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 mb-1">
                    Cantidad Real Recibida <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formReceivedQty}
                    onChange={(e) => setFormReceivedQty(Number(e.target.value))}
                    className="saas-input text-xs text-center font-extrabold border-emerald-400 bg-emerald-50/50 text-emerald-900"
                  />
                </div>
              </div>

              {/* Condición */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Estado Físico / Condición de Entrega
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      checked={formCondition === 'BUEN_ESTADO'}
                      onChange={() => setFormCondition('BUEN_ESTADO')}
                    />
                    <span>Buen Estado (100% OK)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      checked={formCondition === 'MERMA_PARCIAL'}
                      onChange={() => setFormCondition('MERMA_PARCIAL')}
                    />
                    <span>Merma o Faltante</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      checked={formCondition === 'DANADO'}
                      onChange={() => setFormCondition('DANADO')}
                    />
                    <span>Dañado / Rechazado</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones de Recepción / Almacén
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="saas-input text-xs"
                placeholder="Indica sellos de seguridad, temperatura, condición de tarimas o emplaye..."
              />
            </div>
          </div>
        </form>
      </ErpModal>

      {/* 7. Modal Detalle de Recepción */}
      {viewingReception && (
        <ErpModal
          isOpen={true}
          onClose={() => setViewingReception(null)}
          title={`Detalle de Entrada: ${viewingReception.reception_folio}`}
          breadcrumb={['Inicio', 'Almacén', 'Entradas', viewingReception.reception_folio]}
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setViewingReception(null)}
              className="btn-executive-wine"
            >
              Cerrar Acuse
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-400 text-[10px] block">Orden de Compra:</span>
                <span className="font-bold text-blue-700 font-mono text-sm">{viewingReception.po_number}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Almacén Destino:</span>
                <span className="font-bold text-slate-900">{viewingReception.target_warehouse}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Proveedor:</span>
                <span className="font-bold text-slate-900">{viewingReception.supplier_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Fecha de Ingreso:</span>
                <span className="font-mono text-slate-800">{viewingReception.received_at}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Receptor en Turno:</span>
                <span className="font-bold text-slate-900">{viewingReception.receiver_user}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Guía de Transportista:</span>
                <span className="font-mono text-slate-800">{viewingReception.carrier_guide || 'Entrega local directa'}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 min-w-[200px] border-r border-slate-200">Insumo</th>
                    <th className="p-2.5 text-center w-24 border-r border-slate-200">Pedido</th>
                    <th className="p-2.5 text-center w-24 border-r border-slate-200">Recibido</th>
                    <th className="p-2.5 text-center w-32">Estado Inspección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingReception.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-100">{it.product_name}</td>
                      <td className="p-2.5 text-center text-slate-500 border-r border-slate-100">{it.ordered_qty} {it.unit}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700 border-r border-slate-100">+{it.received_qty} {it.unit}</td>
                      <td className="p-2.5 text-center">
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                          {it.condition}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewingReception.notes && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900">
                <strong>Notas de inspección:</strong> {viewingReception.notes}
              </div>
            )}
          </div>
        </ErpModal>
      )}
    </div>
  );
};
