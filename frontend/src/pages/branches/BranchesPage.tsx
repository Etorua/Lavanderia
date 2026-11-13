import React, { useState } from 'react';
import { Branch } from '../../types';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  Store,
  ShieldAlert,
  Lock,
  Unlock,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  TrendingUp,
  Search,
  ChevronDown,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-1',
    name: 'Sucursal Centro (Matriz)',
    code: 'POS-CENTRO',
    address: 'Av. Juárez #100, Col. Centro',
    phone: '55-5555-0101',
    min_consumption: 50000.0,
    current_month_sales: 62500.0,
    is_locked: false,
    lock_reason: null,
    porcentaje_meta: '125%',
    alerta_candado: 'OPERACIÓN NORMAL',
  },
  {
    id: 'b-2',
    name: 'Sucursal Norte (Módulo Plaza)',
    code: 'POS-NORTE',
    address: 'Plaza Norte Local 45',
    phone: '55-5555-0102',
    min_consumption: 30000.0,
    current_month_sales: 4200.0,
    is_locked: true,
    lock_reason: 'Candado comercial activo: Consumo del mes menor al mínimo ($4,200 de $30,000 pactados).',
    porcentaje_meta: '14%',
    alerta_candado: 'BLOQUEADA',
  },
  {
    id: 'b-3',
    name: 'Sucursal Sur Periférico',
    code: 'POS-SUR',
    address: 'Periférico Sur #420, Col. San Ángel',
    phone: '55-5555-0103',
    min_consumption: 40000.0,
    current_month_sales: 38900.0,
    is_locked: false,
    lock_reason: null,
    porcentaje_meta: '97%',
    alerta_candado: 'OPERACIÓN NORMAL',
  },
];

const DEFAULT_BRANCH_COLUMNS: ColumnItem[] = [
  { id: 'code', label: 'Código POS', visible: true, required: true },
  { id: 'branch', label: 'Sucursal / Ubicación', visible: true, required: true },
  { id: 'phone', label: 'Teléfono', visible: true },
  { id: 'min_consumption', label: 'Cuota Mínima ($)', visible: true },
  { id: 'sales', label: 'Ventas Mes ($)', visible: true },
  { id: 'goal', label: 'Cumplimiento Meta', visible: true },
  { id: 'lock_status', label: 'Estado Candado', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [search, setSearch] = useState('');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_BRANCH_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Formulario
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [minConsumption, setMinConsumption] = useState<number | ''>(30000);

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.address && b.address.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLock = (b: Branch) => {
    const nextLocked = !b.is_locked;
    const reason = nextLocked
      ? prompt('Ingresa la razón del bloqueo comercial:', 'Consumo mensual por debajo de la cuota mínima pactada.')
      : null;

    if (nextLocked && !reason) return;

    setBranches((prev) =>
      prev.map((item) =>
        item.id === b.id
          ? {
              ...item,
              is_locked: nextLocked,
              lock_reason: reason,
              alerta_candado: nextLocked ? 'BLOQUEADA' : 'OPERACIÓN NORMAL',
            }
          : item
      )
    );
  };

  const handleDelete = (id: string, branchName: string) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente la sucursal "${branchName}"?`)) {
      setBranches((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setMinConsumption(30000);
    setShowModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setCode(b.code);
    setAddress(b.address || '');
    setPhone(b.phone || '');
    setMinConsumption(b.min_consumption);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const minC = Number(minConsumption) || 0;

    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? {
                ...b,
                name,
                code: code.toUpperCase(),
                address,
                phone,
                min_consumption: minC,
                porcentaje_meta: minC > 0 ? `${Math.round((b.current_month_sales / minC) * 100)}%` : '100%',
              }
            : b
        )
      );
    } else {
      const newB: Branch = {
        id: `b-${Date.now()}`,
        name,
        code: code.toUpperCase(),
        address,
        phone,
        min_consumption: minC,
        current_month_sales: 0,
        is_locked: false,
        lock_reason: null,
        porcentaje_meta: '0%',
        alerta_candado: 'OPERACIÓN NORMAL',
      };
      setBranches([...branches, newB]);
    }

    setShowModal(false);
  };

  const ventasConsolidadas = branches.reduce((acc, b) => acc + b.current_month_sales, 0);
  const cuotaConsolidada = branches.reduce((acc, b) => acc + b.min_consumption, 0);
  const candadosActivos = branches.filter((b) => b.is_locked).length;
  const cumplimientoPromedio =
    cuotaConsolidada > 0 ? Math.round((ventasConsolidadas / cuotaConsolidada) * 100) : 100;

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={Store}
        title="Puntos de Venta & Candados Comerciales"
        subtitle="Supervisa el cumplimiento de consumo mínimo por tienda física. Administra datos de sucursales o aplica candados comerciales para congelar cajas."
        actions={
          <button onClick={handleOpenCreate} className="btn-primary-wine">
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nuevo Punto de Venta</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Red de Sucursales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ventas Globales Mes"
          value={`$${ventasConsolidadas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="wine"
          change={`Meta: $${cuotaConsolidada.toLocaleString('es-MX')}`}
          trend="neutral"
        />
        <KpiCard
          label="Cumplimiento Consolidado"
          value={`${cumplimientoPromedio}%`}
          icon={TrendingUp}
          color={cumplimientoPromedio >= 80 ? 'emerald' : 'amber'}
          change={cumplimientoPromedio >= 100 ? 'Meta mensual superada' : 'En progreso hacia la meta'}
          trend={cumplimientoPromedio >= 80 ? 'up' : 'down'}
        />
        <KpiCard
          label="Sucursales Activas"
          value={branches.length}
          icon={Store}
          color="blue"
          change="Puntos de venta en red"
          trend="neutral"
        />
        <KpiCard
          label="Candados Comerciales"
          value={candadosActivos}
          icon={ShieldAlert}
          color={candadosActivos > 0 ? 'amber' : 'emerald'}
          change={candadosActivos > 0 ? 'Terminales congeladas por deuda' : 'Operación 100% normal'}
          trend={candadosActivos > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Barra de Filtro y Búsqueda Ejecutiva */}
      <div className="saas-filter-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por sucursal, código POS o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <ColumnVisibilityDropdown
          columns={columns}
          onChange={handleColumnChange}
          onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
          onReset={() => setColumns(DEFAULT_BRANCH_COLUMNS)}
        />
      </div>

      {/* Tabla Principal de Puntos de Venta (Estilo SaaS Ejecutivo) */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              {isColVisible('code') && <th className="saas-th w-32 whitespace-nowrap">Código POS</th>}
              {isColVisible('branch') && <th className="saas-th min-w-[240px]">Sucursal / Ubicación</th>}
              {isColVisible('phone') && <th className="saas-th w-36 whitespace-nowrap">Teléfono</th>}
              {isColVisible('min_consumption') && <th className="saas-th w-36 text-right whitespace-nowrap">Cuota Mínima ($)</th>}
              {isColVisible('sales') && <th className="saas-th w-36 text-right whitespace-nowrap">Ventas Mes ($)</th>}
              {isColVisible('goal') && <th className="saas-th w-36 text-center whitespace-nowrap">Cumplimiento Meta</th>}
              {isColVisible('lock_status') && <th className="saas-th w-36 text-center whitespace-nowrap">Estado Candado</th>}
              {isColVisible('actions') && <th className="saas-th w-24 text-center whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                  No se encontraron sucursales registradas con ese término.
                </td>
              </tr>
            ) : (
              filteredBranches.map((b) => {
                const percentage =
                  b.min_consumption > 0
                    ? Math.round((b.current_month_sales / b.min_consumption) * 100)
                    : 100;

                return (
                  <tr key={b.id} className="saas-tr">
                    {/* Código */}
                    {isColVisible('code') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded-md">
                          {b.code}
                        </span>
                      </td>
                    )}

                    {/* Sucursal & Ubicación */}
                    {isColVisible('branch') && (
                      <td className="saas-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">{b.name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{b.address || 'Sin dirección registrada'}</span>
                            </p>
                            {b.is_locked && b.lock_reason && (
                              <p className="text-[10px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>{b.lock_reason}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Teléfono */}
                    {isColVisible('phone') && (
                      <td className="saas-td text-slate-600 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{b.phone || 'S/N'}</span>
                        </span>
                      </td>
                    )}

                    {/* Cuota Mínima */}
                    {isColVisible('min_consumption') && (
                      <td className="saas-td text-right font-mono font-bold text-slate-700 text-xs whitespace-nowrap">
                        ${b.min_consumption.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Ventas Mes */}
                    {isColVisible('sales') && (
                      <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        ${b.current_month_sales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Cumplimiento Meta */}
                    {isColVisible('goal') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] font-extrabold">
                            <span
                              className={
                                percentage >= 100
                                  ? 'text-emerald-700'
                                  : percentage >= 50
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }
                            >
                              {percentage}%
                            </span>
                            <span className="text-slate-400 font-normal">meta</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage >= 100
                                  ? 'bg-emerald-500'
                                  : percentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Estado Candado */}
                    {isColVisible('lock_status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`saas-badge ${
                            b.is_locked ? 'saas-badge-danger' : 'saas-badge-success'
                          }`}
                        >
                          {b.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{b.is_locked ? 'BLOQUEADA' : 'OPERATIVA'}</span>
                        </span>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="saas-td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => toggleLock(b)}
                          className={`action-btn ${
                            b.is_locked ? 'action-btn-green' : 'action-btn-amber'
                          }`}
                          title={b.is_locked ? 'Desbloquear terminales' : 'Activar candado comercial'}
                        >
                          {b.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="action-btn action-btn-edit"
                          title="Modificar sucursal"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="action-btn action-btn-delete"
                          title="Eliminar sucursal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="saas-table-footer">
          <span>Mostrando {filteredBranches.length} de {branches.length} sucursales</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Operativas: <strong className="text-emerald-700">{branches.filter((b) => !b.is_locked).length}</strong></span>
            <span>Bloqueadas: <strong className="text-rose-700">{branches.filter((b) => b.is_locked).length}</strong></span>
          </div>
        </div>
      </div>

      {/* Modal Reutilizable ERP para Aperturar o Modificar Sucursal */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingBranch ? 'Modificar Punto de Venta' : 'Aperturar Nuevo Punto de Venta'}
        breadcrumb={['Inicio', 'Puntos de Venta', editingBranch ? 'Modificar Sucursal' : 'Nueva Sucursal']}
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
              {editingBranch ? 'Guardar Cambios' : 'Aperturar Sucursal'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre de la Sucursal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sucursal Oriente Aeropuerto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="erp-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Código de Punto (POS) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. POS-ORIENTE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="erp-input font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="55-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="erp-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dirección Física / Local
            </label>
            <input
              type="text"
              placeholder="Calle, número, colonia, código postal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cuota Mínima Mensual ($ MXN) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={minConsumption}
              onChange={(e) => setMinConsumption(Number(e.target.value))}
              className="erp-input font-bold"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Si las ventas mensuales del punto caen por debajo de esta cuota, el sistema sugerirá activar el candado comercial.
            </p>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
