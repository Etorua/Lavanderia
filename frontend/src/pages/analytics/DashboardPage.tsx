import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Package,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Megaphone,
  ChevronDown,
  AlertCircle,
  Layers,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';

interface ReorderItem {
  sku: string;
  name: string;
  stock_fisico: number;
  stock_reservado: number;
  stock_transito: number;
  posicion_neta: number;
  cpd: number;
  lead_time: number;
  rop: number;
  max_stock: number;
  cantidad_sugerida: number;
  urgencia: 'CRÍTICA' | 'PREVENTIVA' | 'NORMAL';
}

interface DeadStockItem {
  sku: string;
  name: string;
  stock: number;
  costo: number;
  capital_estancado: number;
  dias_sin_venta: number;
  recomendacion: string;
}

interface FastMovingItem {
  sku: string;
  name: string;
  ventas_30d: number;
  stock: number;
  dias_restantes: number;
  rotacion_clasificacion: 'ALTA' | 'MUY ALTA' | 'ESTRELLA';
}

export const DashboardPage: React.FC = () => {
  // 1. Sugerencias de Reabastecimiento (ROP)
  const [reorderList, setReorderList] = useState<ReorderItem[]>([
    {
      sku: 'LAV-DET-01',
      name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
      stock_fisico: 12,
      stock_reservado: 2,
      stock_transito: 0,
      posicion_neta: 10,
      cpd: 1.5,
      lead_time: 2,
      rop: 20,
      max_stock: 100,
      cantidad_sugerida: 88,
      urgencia: 'CRÍTICA',
    },
    {
      sku: 'EMP-GAN-04',
      name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
      stock_fisico: 25,
      stock_reservado: 5,
      stock_transito: 50,
      posicion_neta: 70,
      cpd: 3.2,
      lead_time: 3,
      rop: 30,
      max_stock: 200,
      cantidad_sugerida: 175,
      urgencia: 'PREVENTIVA',
    },
    {
      sku: 'LAV-SUAV-02',
      name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
      stock_fisico: 35,
      stock_reservado: 2,
      stock_transito: 15,
      posicion_neta: 48,
      cpd: 1.1,
      lead_time: 3,
      rop: 15,
      max_stock: 80,
      cantidad_sugerida: 45,
      urgencia: 'NORMAL',
    },
  ]);

  // 2. Dead Stock (>60 Días)
  const [deadStockList, setDeadStockList] = useState<DeadStockItem[]>([
    {
      sku: 'TINT-SPEC-99',
      name: 'Solvente Quitamanchas Tintas Gráficas y Resinas 5L',
      stock: 15,
      costo: 380.0,
      capital_estancado: 5700.0,
      dias_sin_venta: 85,
      recomendacion: 'Campaña de liquidación con descuento directo a talleres de tintorería y serigrafía.',
    },
    {
      sku: 'EQ-VALV-88',
      name: 'Válvula de Purga para Caldera de Vapor Alta Presión',
      stock: 6,
      costo: 650.0,
      capital_estancado: 3900.0,
      dias_sin_venta: 92,
      recomendacion: 'Publicar en banner "Refacciones & Planchado" para mantenimiento correctivo de calderas.',
    },
  ]);

  // 3. Fast-Moving (Top Rotación 30 Días)
  const [fastMovingList, setFastMovingList] = useState<FastMovingItem[]>([
    {
      sku: 'LAV-DET-01',
      name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
      ventas_30d: 120,
      stock: 45,
      dias_restantes: 9,
      rotacion_clasificacion: 'ESTRELLA',
    },
    {
      sku: 'EMP-GAN-04',
      name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
      ventas_30d: 85,
      stock: 80,
      dias_restantes: 14,
      rotacion_clasificacion: 'MUY ALTA',
    },
    {
      sku: 'EMP-POL-05',
      name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
      ventas_30d: 64,
      stock: 50,
      dias_restantes: 18,
      rotacion_clasificacion: 'ALTA',
    },
  ]);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReorderItem | null>(null);

  // Formulario nuevo reabastecimiento
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState<number | ''>(10);
  const [newRop, setNewRop] = useState<number | ''>(15);
  const [newMax, setNewMax] = useState<number | ''>(100);
  const [newLeadTime, setNewLeadTime] = useState<number | ''>(3);

  // Acciones Eliminar
  const handleDeleteReorder = (sku: string) => {
    if (confirm(`¿Eliminar la regla de reorden para el producto ${sku}?`)) {
      setReorderList((prev) => prev.filter((i) => i.sku !== sku));
    }
  };

  const handleDeleteDeadStock = (sku: string) => {
    if (confirm(`¿Dar de baja o remover producto ${sku} del reporte de Dead Stock?`)) {
      setDeadStockList((prev) => prev.filter((i) => i.sku !== sku));
    }
  };

  const handleDeleteFastMoving = (sku: string) => {
    if (confirm(`¿Quitar producto ${sku} del tablero de alta rotación?`)) {
      setFastMovingList((prev) => prev.filter((i) => i.sku !== sku));
    }
  };

  // Crear o Editar Reorden
  const handleSaveReorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    const sFisico = Number(newStock) || 0;
    const sRop = Number(newRop) || 10;
    const sMax = Number(newMax) || 50;
    const sSugerida = Math.max(0, sMax - sFisico);
    const urg: 'CRÍTICA' | 'PREVENTIVA' | 'NORMAL' =
      sFisico <= sRop / 2 ? 'CRÍTICA' : sFisico <= sRop ? 'PREVENTIVA' : 'NORMAL';

    if (editingItem) {
      setReorderList((prev) =>
        prev.map((i) =>
          i.sku === editingItem.sku
            ? {
                ...i,
                sku: newSku,
                name: newName,
                stock_fisico: sFisico,
                rop: sRop,
                max_stock: sMax,
                cantidad_sugerida: sSugerida,
                posicion_neta: sFisico - i.stock_reservado + i.stock_transito,
                urgencia: urg,
              }
            : i
        )
      );
    } else {
      const newItem: ReorderItem = {
        sku: newSku.toUpperCase(),
        name: newName,
        stock_fisico: sFisico,
        stock_reservado: 0,
        stock_transito: 0,
        posicion_neta: sFisico,
        cpd: 1.0,
        lead_time: Number(newLeadTime) || 3,
        rop: sRop,
        max_stock: sMax,
        cantidad_sugerida: sSugerida,
        urgencia: urg,
      };
      setReorderList([newItem, ...reorderList]);
    }

    setShowAddModal(false);
    setEditingItem(null);
    setNewSku('');
    setNewName('');
    setNewStock(10);
    setNewRop(15);
    setNewMax(100);
  };

  const openEdit = (item: ReorderItem) => {
    setEditingItem(item);
    setNewSku(item.sku);
    setNewName(item.name);
    setNewStock(item.stock_fisico);
    setNewRop(item.rop);
    setNewMax(item.max_stock);
    setNewLeadTime(item.lead_time);
    setShowAddModal(true);
  };

  // KPIs Ejecutivos
  const totalDeadStockCapital = deadStockList.reduce((acc, i) => acc + i.capital_estancado, 0);
  const criticalReorderCount = reorderList.filter((r) => r.urgencia === 'CRÍTICA').length;
  const totalFastMoving30d = fastMovingList.reduce((acc, i) => acc + i.ventas_30d, 0);
  const totalRules = reorderList.length;

  return (
    <div className="saas-container space-y-6">
      {/* Cabecera Principal Unificada */}
      <PageHeader
        title="Pronósticos & Salud del Inventario"
        subtitle="Algoritmos de Punto de Reorden (ROP), detección automática de Dead Stock y rotación por mostrador."
        icon={TrendingUp}
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setNewSku('');
              setNewName('');
              setNewStock(10);
              setNewRop(15);
              setNewMax(100);
              setShowAddModal(true);
            }}
            className="btn-executive-wine py-2 px-4 text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Regla de Reorden</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Salud) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Capital en Dead Stock"
          value={`$${totalDeadStockCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={AlertTriangle}
          color="wine"
          change={`${deadStockList.length} artículos inmovilizados`}
          trend={totalDeadStockCapital > 0 ? 'down' : 'up'}
        />
        <KpiCard
          label="Alertas Críticas ROP"
          value={criticalReorderCount}
          icon={AlertCircle}
          color="amber"
          change={criticalReorderCount > 0 ? 'Requieren compra urgente' : 'Niveles estables'}
          trend={criticalReorderCount > 0 ? 'down' : 'up'}
        />
        <KpiCard
          label="Consumo Fast-Moving (30d)"
          value={`${totalFastMoving30d.toLocaleString('es-MX')} UDS`}
          icon={TrendingUp}
          color="emerald"
          change={`${fastMovingList.length} productos líderes`}
          trend="up"
        />
        <KpiCard
          label="Reglas ROP Supervisadas"
          value={totalRules}
          icon={Package}
          color="blue"
          change="Monitoreo automatizado"
          trend="neutral"
        />
      </div>

      {/* ======================================================== */}
      {/* TABLA 1: SUGERENCIAS AUTOMÁTICAS DE REABASTECIMIENTO    */}
      {/* ======================================================== */}
      <div className="saas-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#580f36]" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Sugerencias Automáticas de Reabastecimiento (Punto de Reorden)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            FÓRMULA ROP = (CONSUMO DIARIO × LEAD TIME) + STOCK SEGURIDAD
          </span>
        </div>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                <th className="saas-th min-w-[220px]">Producto / SKU</th>
                <th className="saas-th text-center w-24">Físico</th>
                <th className="saas-th text-center w-28">Apartado (48h)</th>
                <th className="saas-th text-center w-24">En Tránsito</th>
                <th className="saas-th text-center w-24">Posición Neta</th>
                <th className="saas-th text-center w-32">Punto Reorden (ROP)</th>
                <th className="saas-th text-center w-36">Compra Sugerida (Q)</th>
                <th className="saas-th text-center w-28">Urgencia</th>
                <th className="saas-th text-center w-24">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reorderList.map((item) => (
                <tr key={item.sku} className="saas-tr">
                  <td className="saas-td">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 mr-2">
                      {item.sku}
                    </span>
                    <span className="font-semibold text-slate-900">{item.name}</span>
                  </td>
                  <td className="saas-td text-center font-bold text-slate-700">{item.stock_fisico}</td>
                  <td className="saas-td text-center text-amber-700 font-bold">
                    {item.stock_reservado > 0 ? `-${item.stock_reservado}` : '0'}
                  </td>
                  <td className="saas-td text-center text-blue-700 font-bold">
                    {item.stock_transito > 0 ? `+${item.stock_transito}` : '0'}
                  </td>
                  <td className="saas-td text-center font-black text-slate-900">{item.posicion_neta}</td>
                  <td className="saas-td text-center font-bold text-slate-500">{item.rop}</td>
                  <td className="saas-td text-right">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                      +{item.cantidad_sugerida} uds
                    </span>
                  </td>
                  <td className="saas-td text-center">
                    <span
                      className={
                        item.urgencia === 'CRÍTICA'
                          ? 'saas-badge-danger'
                          : item.urgencia === 'PREVENTIVA'
                          ? 'saas-badge-warning'
                          : 'saas-badge-success'
                      }
                    >
                      {item.urgencia}
                    </span>
                  </td>
                  <td className="saas-td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(item)}
                        className="action-btn action-btn-edit"
                        title="Modificar regla ROP"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReorder(item.sku)}
                        className="action-btn action-btn-delete"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="saas-table-footer">
            <span>Mostrando {reorderList.length} reglas de reabastecimiento</span>
            <span>Urgencia Crítica: <strong className="text-rose-700">{criticalReorderCount}</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLA 2: DETECTOR DE DEAD STOCK (> 60 DÍAS)              */}
      {/* ======================================================== */}
      <div className="saas-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Detector de Productos Sin Movimiento (Dead Stock &gt; 60 Días)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            {deadStockList.length} ARTÍCULOS INMOVILIZADOS
          </span>
        </div>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                <th className="saas-th min-w-[220px]">SKU / Producto</th>
                <th className="saas-th text-center w-32">Stock Inmovilizado</th>
                <th className="saas-th text-right w-28">Costo Unit.</th>
                <th className="saas-th text-right w-32">Capital Estancado</th>
                <th className="saas-th text-center w-28">Días Sin Venta</th>
                <th className="saas-th min-w-[200px]">Estrategia Recomendada</th>
                <th className="saas-th text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {deadStockList.map((p) => (
                <tr key={p.sku} className="saas-tr">
                  <td className="saas-td">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 mr-2">
                      {p.sku}
                    </span>
                    <span className="font-semibold text-slate-900">{p.name}</span>
                  </td>
                  <td className="saas-td text-center font-bold text-slate-700">{p.stock} UDS</td>
                  <td className="saas-td text-right font-medium text-slate-600">${p.costo.toFixed(2)}</td>
                  <td className="saas-td text-right font-black text-rose-700">
                    ${p.capital_estancado.toFixed(2)}
                  </td>
                  <td className="saas-td text-center">
                    <span className="saas-badge-danger">
                      {p.dias_sin_venta} DÍAS
                    </span>
                  </td>
                  <td className="saas-td normal-case text-slate-600 text-xs max-w-xs">
                    {p.recomendacion}
                  </td>
                  <td className="saas-td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          alert(`Se ha enviado una solicitud a Mercadotecnia para crear un Banner de Liquidación para ${p.name}.`)
                        }
                        className="action-btn action-btn-amber"
                        title="Crear oferta relámpago de liquidación"
                      >
                        <Megaphone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeadStock(p.sku)}
                        className="action-btn action-btn-delete"
                        title="Eliminar de reporte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="saas-table-footer">
            <span>Mostrando {deadStockList.length} artículos inmovilizados</span>
            <span>Capital Estancado: <strong className="text-rose-700">${totalDeadStockCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLA 3: TOP PRODUCTOS DE MAYOR ROTACIÓN (FAST-MOVING)   */}
      {/* ======================================================== */}
      <div className="saas-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              Top Productos de Mayor Rotación (Consumo Últimos 30 Días)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            FAST-MOVING EN MOSTRADOR
          </span>
        </div>

        <div className="saas-table-container">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                <th className="saas-th min-w-[220px]">SKU / Producto</th>
                <th className="saas-th text-center w-32">Ventas 30 Días</th>
                <th className="saas-th text-center w-32">Stock Disponible</th>
                <th className="saas-th text-center w-40">Días de Inventario Restante</th>
                <th className="saas-th text-center w-32">Clasificación</th>
                <th className="saas-th text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {fastMovingList.map((p) => (
                <tr key={p.sku} className="saas-tr">
                  <td className="saas-td">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 mr-2">
                      {p.sku}
                    </span>
                    <span className="font-semibold text-slate-900">{p.name}</span>
                  </td>
                  <td className="saas-td text-center font-bold text-slate-700">
                    {p.ventas_30d} UDS
                  </td>
                  <td className="saas-td text-center font-bold text-slate-700">{p.stock} UDS</td>
                  <td className="saas-td text-center">
                    <span
                      className={
                        p.dias_restantes <= 10
                          ? 'saas-badge-danger'
                          : 'saas-badge-success'
                      }
                    >
                      {p.dias_restantes} DÍAS
                    </span>
                  </td>
                  <td className="saas-td text-center">
                    <span className="saas-badge-wine">
                      {p.rotacion_clasificacion}
                    </span>
                  </td>
                  <td className="saas-td text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() =>
                          alert(`Se ha generado una sugerencia de compra prioritaria para ${p.name}.`)
                        }
                        className="action-btn action-btn-view"
                        title="Generar resurtido"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFastMoving(p.sku)}
                        className="action-btn action-btn-delete"
                        title="Eliminar del tablero"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="saas-table-footer">
            <span>Mostrando {fastMovingList.length} artículos de alta rotación</span>
            <span>Consumo acumulado 30d: <strong className="text-emerald-700">{totalFastMoving30d} UDS</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL ERP: AGREGAR / MODIFICAR REGLA DE REORDEN         */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingItem ? 'Modificar Regla de Reorden' : 'Nueva Regla de Reorden ROP'}
        breadcrumb={['Inicio', 'Pronósticos & ROP', editingItem ? 'Editar Regla' : 'Nueva Regla']}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-executive-secondary py-2 px-4 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="reorder-form"
              className="btn-executive-wine py-2 px-4 text-xs"
            >
              {editingItem ? 'Guardar Cambios' : 'Registrar Regla'}
            </button>
          </div>
        }
      >
        <form id="reorder-form" onSubmit={handleSaveReorder} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Código SKU:</label>
            <input
              type="text"
              required
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              placeholder="Ej. PROD-CEM-01"
              className="saas-search-input w-full font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre del Producto:</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Bulto de Cemento Gris 50kg"
              className="saas-search-input w-full font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Físico Actual:</label>
              <input
                type="number"
                required
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(Number(e.target.value))}
                className="saas-search-input w-full font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Punto Reorden (ROP):</label>
              <input
                type="number"
                required
                min="1"
                value={newRop}
                onChange={(e) => setNewRop(Number(e.target.value))}
                className="saas-search-input w-full font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Máximo Deseado:</label>
              <input
                type="number"
                required
                min="1"
                value={newMax}
                onChange={(e) => setNewMax(Number(e.target.value))}
                className="saas-search-input w-full font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Lead Time (Días):</label>
              <input
                type="number"
                required
                min="1"
                value={newLeadTime}
                onChange={(e) => setNewLeadTime(Number(e.target.value))}
                className="saas-search-input w-full font-bold"
              />
            </div>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
