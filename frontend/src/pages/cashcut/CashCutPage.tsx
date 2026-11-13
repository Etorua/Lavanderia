import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CashCut } from '../../types';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  DollarSign,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  Coins,
  CreditCard,
  Send,
  Building,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  concept: string;
  amount: number;
  time: string;
  authorizedBy: string;
}

const DEFAULT_CASHCUT_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio / Turno', visible: true, required: true },
  { id: 'cashier', label: 'Cajero Responsable', visible: true, required: true },
  { id: 'initial_cash', label: 'Fondo Inicial', visible: true },
  { id: 'total_sales', label: 'Ventas Totales', visible: true },
  { id: 'expected_cash', label: 'Efectivo Esperado', visible: true },
  { id: 'actual_cash', label: 'Efectivo Contado', visible: true },
  { id: 'difference', label: 'Diferencia', visible: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const CashCutPage: React.FC = () => {
  const { user } = useAuth();

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_CASHCUT_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Historial de Cortes de Caja
  const [cutsList, setCutsList] = useState<CashCut[]>([
    {
      id: 'cut-101',
      branch_id: 'branch-centro',
      user_id: 'usr-cajero',
      initial_cash: 1000.0,
      cash_sales: 3500.0,
      card_sales: 2400.0,
      transfer_sales: 1200.0,
      mixed_sales: 0,
      total_sales: 7100.0,
      expected_cash: 4500.0,
      actual_cash_counted: 4500.0,
      difference: 0.0,
      notes: 'Arqueo cuadrado sin discrepancias.',
      status: 'AUDITADO_LOCAL',
      opened_at: '2026-11-08T08:00:00Z',
      closed_at: '2026-11-08T20:00:00Z',
      user: { full_name: 'Juan Pérez (Cajero)', email: 'cajero.centro@alpha.com' },
    },
    {
      id: 'cut-102',
      branch_id: 'branch-centro',
      user_id: 'usr-cajero',
      initial_cash: 1000.0,
      cash_sales: 4200.0,
      card_sales: 3100.0,
      transfer_sales: 850.0,
      mixed_sales: 0,
      total_sales: 8150.0,
      expected_cash: 5200.0,
      actual_cash_counted: null,
      difference: null,
      notes: null,
      status: 'ABIERTO',
      opened_at: '2026-11-09T08:00:00Z',
      user: { full_name: 'Juan Pérez (Cajero)', email: 'cajero.centro@alpha.com' },
    },
  ]);

  // Gastos de Caja Chica
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: 'exp-1',
      concept: 'Rollos térmicos para impresora de tickets',
      amount: 150.0,
      time: '10:30 AM',
      authorizedBy: 'Gerente Centro',
    },
    {
      id: 'exp-2',
      concept: 'Artículos de limpieza para mostrador y piso',
      amount: 85.0,
      time: '01:15 PM',
      authorizedBy: 'Gerente Centro',
    },
  ]);

  // Modales
  const [showCountModal, setShowCountModal] = useState(false);
  const [selectedCutForCount, setSelectedCutForCount] = useState<CashCut | null>(null);
  const [countedInput, setCountedInput] = useState<number | ''>('');
  const [closingNotes, setClosingNotes] = useState('');

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');

  const handleOpenCount = (cut: CashCut) => {
    setSelectedCutForCount(cut);
    setCountedInput('');
    setClosingNotes('');
    setShowCountModal(true);
  };

  const handleCloseCashCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCutForCount || countedInput === '') return;

    const counted = Number(countedInput);
    const diff = counted - selectedCutForCount.expected_cash;

    setCutsList((prev) =>
      prev.map((c) =>
        c.id === selectedCutForCount.id
          ? {
              ...c,
              actual_cash_counted: counted,
              difference: diff,
              notes: closingNotes,
              status: 'CERRADO',
              closed_at: new Date().toISOString(),
            }
          : c
      )
    );

    setShowCountModal(false);
  };

  const handleAudit = (id: string) => {
    setCutsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'AUDITADO_LOCAL' } : c))
    );
    alert('Corte de caja validado y auditado con éxito.');
  };

  const handleDeleteCut = (id: string) => {
    if (confirm(`¿Eliminar el registro de corte de caja ${id}?`)) {
      setCutsList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleOpenExpenseCreate = () => {
    setEditingExpense(null);
    setExpenseConcept('');
    setExpenseAmount('');
    setShowExpenseModal(true);
  };

  const handleOpenExpenseEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setExpenseConcept(exp.concept);
    setExpenseAmount(exp.amount);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('¿Eliminar este comprobante de gasto de caja chica?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseConcept || expenseAmount === '') return;

    const amt = Number(expenseAmount);

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editingExpense.id ? { ...e, concept: expenseConcept, amount: amt } : e
        )
      );
    } else {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        concept: expenseConcept,
        amount: amt,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authorizedBy: user?.full_name || 'Gerente Sucursal',
      };
      setExpenses([newExp, ...expenses]);
    }

    setShowExpenseModal(false);
  };

  const totalDeclarado = cutsList.reduce((acc, c) => acc + (c.total_sales || 0), 0);
  const totalEfectivo = cutsList.reduce((acc, c) => acc + (c.cash_sales || 0), 0);
  const totalTarjeta = cutsList.reduce((acc, c) => acc + (c.card_sales || 0), 0);
  const totalEgresos = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={DollarSign}
        title="Corte de Caja Diario & Caja Chica"
        subtitle="Conciliación de arqueo ciego, control de diferencias (faltantes/sobrantes) y registro de egresos menores de sucursal."
        actions={
          <button onClick={handleOpenExpenseCreate} className="btn-executive-wine">
            <Plus className="w-4 h-4" />
            <span>+ Registrar Gasto de Caja Chica</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Tesorería) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Ingresos Declarados"
          value={`$${totalDeclarado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="wine"
          change={`${cutsList.length} turnos auditados`}
          trend="neutral"
        />
        <KpiCard
          label="Efectivo en Caja"
          value={`$${totalEfectivo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={Coins}
          color="emerald"
          change="Arqueo físico disponible"
          trend="neutral"
        />
        <KpiCard
          label="Terminales & Tarjeta"
          value={`$${totalTarjeta.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={CreditCard}
          color="blue"
          change="Lote bancario en proceso"
          trend="neutral"
        />
        <KpiCard
          label="Egresos Caja Chica"
          value={`$${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="amber"
          change={`${expenses.length} comprobantes de gasto`}
          trend="neutral"
        />
      </div>

      {/* ======================================================== */}
      {/* TABLA 1: CORTES DE CAJA POR TURNO / DÍA (ESTILO SAAS)    */}
      {/* ======================================================== */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#580f36]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Historial de Cortes de Caja y Arqueos Diarios
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Registros: {cutsList.length}
            </span>
            <ColumnVisibilityDropdown
              columns={columns}
              onChange={handleColumnChange}
              onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
              onReset={() => setColumns(DEFAULT_CASHCUT_COLUMNS)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                {isColVisible('folio') && <th className="saas-th w-32 whitespace-nowrap">Folio / Turno</th>}
                {isColVisible('cashier') && <th className="saas-th min-w-[200px]">Cajero Responsable</th>}
                {isColVisible('initial_cash') && <th className="saas-th text-right w-28 whitespace-nowrap">Fondo Inicial</th>}
                {isColVisible('total_sales') && <th className="saas-th text-right w-28 whitespace-nowrap">Ventas Totales</th>}
                {isColVisible('expected_cash') && <th className="saas-th text-right w-32 whitespace-nowrap">Efectivo Esperado</th>}
                {isColVisible('actual_cash') && <th className="saas-th text-right w-32 whitespace-nowrap">Efectivo Contado</th>}
                {isColVisible('difference') && <th className="saas-th text-right w-28 whitespace-nowrap">Diferencia</th>}
                {isColVisible('status') && <th className="saas-th text-center w-28 whitespace-nowrap">Estado</th>}
                {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {cutsList.map((cut) => {
                const diff = cut.difference ?? 0;
                const isExact = diff === 0;
                const isShort = diff < 0;

                return (
                  <tr key={cut.id} className="saas-tr">
                    {isColVisible('folio') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded-md">
                          {cut.id.toUpperCase()}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {new Date(cut.opened_at).toLocaleDateString('es-MX')}
                        </p>
                      </td>
                    )}

                    {isColVisible('cashier') && (
                      <td className="saas-td">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                            {(cut.user?.full_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 text-xs">
                            {cut.user?.full_name || 'Cajero de Turno'}
                          </span>
                        </div>
                      </td>
                    )}

                    {isColVisible('initial_cash') && (
                      <td className="saas-td text-right font-mono text-xs text-slate-600 whitespace-nowrap">
                        ${cut.initial_cash.toFixed(2)}
                      </td>
                    )}

                    {isColVisible('total_sales') && (
                      <td className="saas-td text-right font-mono font-semibold text-slate-700 text-xs whitespace-nowrap">
                        ${cut.total_sales.toFixed(2)}
                      </td>
                    )}

                    {isColVisible('expected_cash') && (
                      <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        ${cut.expected_cash.toFixed(2)}
                      </td>
                    )}

                    {isColVisible('actual_cash') && (
                      <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        {cut.actual_cash_counted !== null ? (
                          `$${cut.actual_cash_counted.toFixed(2)}`
                        ) : (
                          <span className="text-slate-400 font-normal italic text-xs">Pendiente</span>
                        )}
                      </td>
                    )}

                    {isColVisible('difference') && (
                      <td className="saas-td text-right whitespace-nowrap">
                        {cut.difference !== null ? (
                          <span
                            className={`saas-badge ${
                              isExact
                                ? 'saas-badge-success'
                                : isShort
                                ? 'saas-badge-danger'
                                : 'saas-badge-info'
                            }`}
                          >
                            {isExact
                              ? '$0.00 Exacto'
                              : isShort
                              ? `-$${Math.abs(diff).toFixed(2)}`
                              : `+$${diff.toFixed(2)}`}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    )}

                    {isColVisible('status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`saas-badge ${
                            cut.status === 'AUDITADO_LOCAL'
                              ? 'saas-badge-success'
                              : cut.status === 'CERRADO'
                              ? 'saas-badge-info'
                              : 'saas-badge-warning'
                          }`}
                        >
                          {cut.status === 'AUDITADO_LOCAL' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : cut.status === 'CERRADO' ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                          <span>{cut.status}</span>
                        </span>
                      </td>
                    )}

                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {cut.status === 'ABIERTO' ? (
                            <button
                              onClick={() => handleOpenCount(cut)}
                              className="action-btn action-btn-view"
                              title="Realizar arqueo de caja"
                            >
                              <Coins className="w-4 h-4" />
                            </button>
                          ) : cut.status === 'CERRADO' ? (
                            <button
                              onClick={() => handleAudit(cut.id)}
                              className="action-btn action-btn-green"
                              title="Auditar y validar corte"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleDeleteCut(cut.id)}
                            className="action-btn action-btn-delete"
                            title="Eliminar corte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    </td>
                  )}
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="saas-table-footer">
          <span>Mostrando {cutsList.length} cortes de caja</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Auditados: <strong className="text-emerald-700">{cutsList.filter((c) => c.status.includes('AUDITADO')).length}</strong></span>
            <span>Pendientes / Abiertos: <strong className="text-amber-700">{cutsList.filter((c) => !c.status.includes('AUDITADO')).length}</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLA 2: GASTOS DE CAJA CHICA (SALIDAS DE EFECTIVO)     */}
      {/* ======================================================== */}
      <div className="saas-card overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#580f36]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Comprobantes de Salida de Caja Chica (Egresos Locales)
            </h2>
          </div>
          <span className="saas-badge saas-badge-warning">
            Total Egresos: ${totalEgresos.toFixed(2)} MXN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                <th className="saas-th w-28 text-center">Hora</th>
                <th className="saas-th min-w-[240px]">Concepto del Gasto</th>
                <th className="saas-th w-44">Autorizado Por</th>
                <th className="saas-th text-right w-36">Importe ($ MXN)</th>
                <th className="saas-th text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="saas-tr">
                  <td className="saas-td text-center text-slate-500 font-mono text-xs">{exp.time}</td>
                  <td className="saas-td font-bold text-slate-900 text-xs">{exp.concept}</td>
                  <td className="saas-td text-slate-600 text-xs">{exp.authorizedBy}</td>
                  <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs">
                    ${exp.amount.toFixed(2)}
                  </td>
                  <td className="saas-td text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenExpenseEdit(exp)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Modificar gasto"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="saas-table-footer">
          <span>Mostrando {expenses.length} egresos de caja chica</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Total Retirado: <strong className="text-rose-700">${totalEgresos.toFixed(2)} MXN</strong></span>
          </div>
        </div>
      </div>

      {/* Modal ERP: Arqueo Ciego de Caja */}
      <ErpModal
        isOpen={showCountModal && !!selectedCutForCount}
        onClose={() => setShowCountModal(false)}
        title={selectedCutForCount ? `Arqueo Ciego de Caja (${selectedCutForCount.id.toUpperCase()})` : 'Arqueo de Caja'}
        breadcrumb={['Inicio', 'Cortes de Caja', 'Arqueo Ciego']}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCountModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCloseCashCut}
              className="erp-btn-primary"
            >
              Cerrar Turno & Conciliar
            </button>
          </>
        }
      >
        {selectedCutForCount && (
          <form onSubmit={handleCloseCashCut} className="space-y-4">
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Fondo Inicial:</span>
                <span className="font-bold text-gray-900">${selectedCutForCount.initial_cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ventas Registradas en Turno:</span>
                <span className="font-bold text-gray-900">${selectedCutForCount.total_sales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span className="text-gray-900">Efectivo Físico Esperado en Cajón:</span>
                <span className="text-black font-extrabold">${selectedCutForCount.expected_cash.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Efectivo Físico Contado en Monedas y Billetes ($ MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={countedInput}
                onChange={(e) => setCountedInput(Number(e.target.value))}
                className="erp-input text-lg font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Observaciones / Justificación de Cierre
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Arqueo completado al cambio de turno de la tarde"
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="erp-input normal-case"
              />
            </div>
          </form>
        )}
      </ErpModal>

      {/* Modal ERP: Agregar / Modificar Gasto de Caja Chica */}
      <ErpModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={editingExpense ? 'Modificar Gasto de Caja Chica' : 'Registrar Gasto de Caja Chica'}
        breadcrumb={['Inicio', 'Caja Chica', editingExpense ? 'Modificar Gasto' : 'Nuevo Comprobante']}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowExpenseModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveExpense}
              className="erp-btn-primary"
            >
              {editingExpense ? 'Actualizar Gasto' : 'Registrar Salida de Efectivo'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Concepto del Gasto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Compra de rollos de ticket o café para clientes"
              value={expenseConcept}
              onChange={(e) => setExpenseConcept(e.target.value)}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Importe Retirado ($ MXN) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              min="1"
              placeholder="0.00"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(Number(e.target.value))}
              className="erp-input font-bold"
            />
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
