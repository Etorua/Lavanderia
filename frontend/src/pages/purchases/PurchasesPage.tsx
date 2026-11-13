import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { getStoredSuppliers } from '../../data/suppliersData';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
  Trash2,
  PackageCheck,
  FileText,
  Package,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  DollarSign,
} from 'lucide-react';

interface POItemRow {
  product_id: string;
  sku: string;
  product_name: string;
  category: string;
  current_stock: number;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  supplier_contact: string;
  items: POItemRow[];
  total: number;
  items_count: number;
  status: 'BORRADOR' | 'EMITIDA' | 'EN_TRANSITO' | 'RECIBIDA_TOTAL' | 'CANCELADA';
  created_at: string;
  expected_delivery: string;
}

interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
}

// Catálogo sincronizado con inventario de Lavandería & Tintorería
const INITIAL_INVENTORY_PRODUCTS: CatalogProduct[] = [
  {
    id: 'p1',
    sku: 'LAV-DET-01',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    cost: 420.0,
    price: 680.0,
    stock: 45,
  },
  {
    id: 'p2',
    sku: 'LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    cost: 310.0,
    price: 540.0,
    stock: 35,
  },
  {
    id: 'p3',
    sku: 'TINT-SOLV-03',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    cost: 980.0,
    price: 1450.0,
    stock: 18,
  },
  {
    id: 'p4',
    sku: 'EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    cost: 290.0,
    price: 485.0,
    stock: 80,
  },
  {
    id: 'p5',
    sku: 'EMP-POL-05',
    name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
    category: 'Empaque & Ganchos',
    cost: 560.0,
    price: 890.0,
    stock: 50,
  },
  {
    id: 'p6',
    sku: 'DESM-GRAS-06',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    category: 'Desmanchadores & Solventes Secos',
    cost: 240.0,
    price: 420.0,
    stock: 28,
  },
  {
    id: 'p7',
    sku: 'EQ-PLANC-07',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    category: 'Refacciones & Planchado',
    cost: 180.0,
    price: 320.0,
    stock: 22,
  },
  {
    id: 'p8',
    sku: 'LAV-OXI-10',
    name: 'Blanqueador Oxigenado Textil en Polvo Saco 25kg (Color Seguro)',
    category: 'Detergentes & Químicos',
    cost: 590.0,
    price: 950.0,
    stock: 40,
  },
];

const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-1',
    po_number: 'PO-2026-0018',
    supplier_name: 'Química Industrial & Detergentes de México S.A.',
    supplier_contact: 'ventas@quimicaindustrial.com.mx (55-8888-0000)',
    items: [
      {
        product_id: 'p1',
        sku: 'LAV-DET-01',
        product_name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
        category: 'Detergentes & Químicos',
        current_stock: 45,
        quantity: 50,
        unit_cost: 420.0,
        subtotal: 21000.0,
      },
    ],
    total: 21000.0,
    items_count: 50,
    status: 'EN_TRANSITO',
    created_at: '2026-11-07',
    expected_delivery: '2026-11-10',
  },
  {
    id: 'po-2',
    po_number: 'PO-2026-0017',
    supplier_name: 'Metalmecánica & Ganchos del Norte S.A.',
    supplier_contact: 'pedidos@ganchosdelnorte.com',
    items: [
      {
        product_id: 'p4',
        sku: 'EMP-GAN-04',
        product_name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
        category: 'Empaque & Ganchos',
        current_stock: 80,
        quantity: 50,
        unit_cost: 290.0,
        subtotal: 14500.0,
      },
    ],
    total: 14500.0,
    items_count: 50,
    status: 'RECIBIDA_TOTAL',
    created_at: '2026-11-05',
    expected_delivery: '2026-11-08',
  },
  {
    id: 'po-3',
    po_number: 'PO-2026-0019',
    supplier_name: 'Solventes & Químicos de Tintorería Internacional',
    supplier_contact: 'contacto@solventestintoreria.com',
    items: [
      {
        product_id: 'p3',
        sku: 'TINT-SOLV-03',
        product_name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
        category: 'Desmanchadores & Solventes Secos',
        current_stock: 18,
        quantity: 20,
        unit_cost: 980.0,
        subtotal: 19600.0,
      },
      {
        product_id: 'p6',
        sku: 'DESM-GRAS-06',
        product_name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
        category: 'Desmanchadores & Solventes Secos',
        current_stock: 28,
        quantity: 15,
        unit_cost: 240.0,
        subtotal: 3600.0,
      },
    ],
    total: 23200.0,
    items_count: 35,
    status: 'EMITIDA',
    created_at: '2026-11-08',
    expected_delivery: '2026-11-14',
  },
];

const DEFAULT_PURCHASES_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio PO', visible: true, required: true },
  { id: 'supplier', label: 'Fabricante / Proveedor', visible: true, required: true },
  { id: 'created_at', label: 'Fecha Emisión', visible: true },
  { id: 'delivery', label: 'Promesa Entrega', visible: true },
  { id: 'items', label: 'Partidas / Piezas', visible: true },
  { id: 'total', label: 'Importe Total', visible: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const PurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [poList, setPoList] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [inventoryCatalog, setInventoryCatalog] = useState<CatalogProduct[]>(INITIAL_INVENTORY_PRODUCTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODAS');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_PURCHASES_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Modal Crear / Editar PO
  const [showModal, setShowModal] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  // Formulario de Cabecera PO
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-11-15');

  // Tabla de Partidas de la Orden
  const [poItems, setPoItems] = useState<POItemRow[]>([]);

  // Buscador de productos del inventario
  const [prodSearch, setProdSearch] = useState('');
  const [showProdDropdown, setShowProdDropdown] = useState(false);

  // Modal para Dar de Alta Producto Nuevo si no existe
  const [showNewProdModal, setShowNewProdModal] = useState(false);
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Detergentes & Químicos');
  const [newProdCost, setNewProdCost] = useState<number | ''>(100);
  const [newProdPrice, setNewProdPrice] = useState<number | ''>(160);

  // Ver detalle de partidas en la tabla principal
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);

  // Búsqueda en catálogo de inventario
  const searchedProducts = inventoryCatalog.filter((p) => {
    if (!prodSearch.trim()) return false;
    const term = prodSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  // Agregar producto existente a la PO
  const handleSelectProduct = (product: CatalogProduct) => {
    const existingIndex = poItems.findIndex((it) => it.product_id === product.id);
    if (existingIndex >= 0) {
      const updated = [...poItems];
      const newQty = updated[existingIndex].quantity + 10;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * updated[existingIndex].unit_cost;
      setPoItems(updated);
    } else {
      const newItem: POItemRow = {
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        category: product.category,
        current_stock: product.stock,
        quantity: 10,
        unit_cost: product.cost,
        subtotal: 10 * product.cost,
      };
      setPoItems([...poItems, newItem]);
    }

    setProdSearch('');
    setShowProdDropdown(false);
  };

  // Modificar cantidad en partida PO
  const handleUpdateItemQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    const updated = [...poItems];
    updated[index].quantity = qty;
    updated[index].subtotal = qty * updated[index].unit_cost;
    setPoItems(updated);
  };

  // Modificar costo de compra en partida PO
  const handleUpdateItemCost = (index: number, cost: number) => {
    if (cost < 0) return;
    const updated = [...poItems];
    updated[index].unit_cost = cost;
    updated[index].subtotal = updated[index].quantity * cost;
    setPoItems(updated);
  };

  // Eliminar partida PO
  const handleRemoveItem = (index: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Dar de alta un producto nuevo en inventario y agregarlo a la PO
  const handleRegisterNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdSku || !newProdName) return;

    const costNum = Number(newProdCost) || 0;
    const priceNum = Number(newProdPrice) || costNum * 1.4;

    const newProduct: CatalogProduct = {
      id: `p-${Date.now()}`,
      sku: newProdSku.toUpperCase(),
      name: newProdName,
      category: newProdCategory,
      cost: costNum,
      price: priceNum,
      stock: 0, // Inicia con 0 hasta que llegue la PO
    };

    // Agregar al catálogo general de inventario
    setInventoryCatalog((prev) => [newProduct, ...prev]);

    // Agregar como partida en la orden de compra
    const newItem: POItemRow = {
      product_id: newProduct.id,
      sku: newProduct.sku,
      product_name: newProduct.name,
      category: newProduct.category,
      current_stock: 0,
      quantity: 20,
      unit_cost: costNum,
      subtotal: 20 * costNum,
    };
    setPoItems((prev) => [...prev, newItem]);

    setShowNewProdModal(false);
    setNewProdSku('');
    setNewProdName('');
    alert(`¡Producto ${newProduct.name} dado de alta con éxito en el catálogo de inventario e incorporado a la Orden de Compra!`);
  };

  // Totales de la PO actual
  const poTotalPieces = poItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const poTotalAmount = poItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  // Apertura de Modales
  const handleOpenCreate = () => {
    setEditingPO(null);
    setSupplierName('');
    setSupplierContact('');
    setExpectedDate('2026-11-20');
    setPoItems([]);
    setShowModal(true);
  };

  const handleOpenEdit = (po: PurchaseOrder) => {
    setEditingPO(po);
    setSupplierName(po.supplier_name);
    setSupplierContact(po.supplier_contact);
    setExpectedDate(po.expected_delivery);
    setPoItems(po.items || []);
    setShowModal(true);
  };

  const handleDelete = (id: string, poNum: string) => {
    if (confirm(`¿Estás seguro de cancelar y eliminar la orden de compra ${poNum}?`)) {
      setPoList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Recepción de Mercancía en Almacén
  const handleReceiveStock = (po: PurchaseOrder) => {
    // Incrementar el stock real en el inventario por cada partida
    setInventoryCatalog((prev) =>
      prev.map((catProd) => {
        const matchingItem = po.items.find((it) => it.product_id === catProd.id || it.sku === catProd.sku);
        if (matchingItem) {
          return {
            ...catProd,
            stock: catProd.stock + matchingItem.quantity,
          };
        }
        return catProd;
      })
    );

    // Marcar la PO como RECIBIDA_TOTAL
    setPoList((prev) =>
      prev.map((p) => (p.id === po.id ? { ...p, status: 'RECIBIDA_TOTAL' } : p))
    );

    alert(
      `¡Recepción completada!\nSe han ingresado ${po.items_count} piezas al Almacén Central y actualizado las existencias en Kardex.`
    );
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName) {
      alert('Por favor ingresa el nombre del proveedor o fabricante.');
      return;
    }

    if (poItems.length === 0) {
      alert('Debes agregar al menos un producto a la tabla de partidas de la orden de compra.');
      return;
    }

    if (editingPO) {
      setPoList((prev) =>
        prev.map((p) =>
          p.id === editingPO.id
            ? {
                ...p,
                supplier_name: supplierName,
                supplier_contact: supplierContact,
                expected_delivery: expectedDate,
                items: poItems,
                total: poTotalAmount,
                items_count: poTotalPieces,
              }
            : p
        )
      );
    } else {
      const nextNum = poList.length + 20;
      const newPO: PurchaseOrder = {
        id: `po-${Date.now()}`,
        po_number: `PO-2026-00${nextNum}`,
        supplier_name: supplierName,
        supplier_contact: supplierContact,
        items: poItems,
        total: poTotalAmount,
        items_count: poTotalPieces,
        status: 'EMITIDA',
        created_at: new Date().toISOString().split('T')[0],
        expected_delivery: expectedDate,
      };
      setPoList([newPO, ...poList]);
    }

    setShowModal(false);
  };

  const filtered = poList.filter((po) => {
    const matchesSearch =
      po.po_number.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
      po.items.some((it) => it.product_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'TODAS' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCompras = poList.reduce((acc, p) => acc + p.total, 0);
  const totalEnTransito = poList.filter((p) => p.status === 'EN_TRANSITO').length;
  const totalRecibidas = poList.filter((p) => p.status === 'RECIBIDA_TOTAL').length;
  const totalPiezasPendientes = poList
    .filter((p) => p.status !== 'RECIBIDA_TOTAL')
    .reduce((acc, p) => acc + p.items_count, 0);

  const isPurchaser = ['COMPRADOR_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'].includes(user?.role || '');

  if (!isPurchaser && user?.role.includes('ALMACENISTA')) {
    return (
      <div className="saas-container py-12">
        <div className="max-w-md mx-auto saas-card p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-[#580f36] flex items-center justify-center mx-auto border border-pink-200 shadow-xs">
            <Truck className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Módulo de Compras (Exclusivo)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Las <strong>Órdenes de Compra (PO)</strong> son competencia exclusiva del <strong>Departamento de Compras</strong>.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Como <strong>Almacenista</strong>, tu labor está concentrada en la administración de <strong>Kardex & Almacén</strong>, donde registras entradas (+), salidas (-) y control físico de existencias.
          </p>
          <div className="pt-2">
            <Link to="/admin/inventory" className="btn-executive-wine inline-flex items-center gap-1.5 text-xs">
              <span>Ir a Kardex & Almacén</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={Truck}
        title="Órdenes de Compra (Procurement & Abastecimiento)"
        subtitle="Genera órdenes de compra estructuradas con partidas conectadas directamente al inventario. Registra productos nuevos o abastece líneas críticas."
        actions={
          <button onClick={handleOpenCreate} className="btn-primary-wine">
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nueva Orden de Compra (PO)</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Compras) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Inversión Total en PO"
          value={`$${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="wine"
          change={`${poList.length} órdenes generadas`}
          trend="neutral"
        />
        <KpiCard
          label="En Tránsito hacia Almacén"
          value={totalEnTransito}
          icon={Truck}
          color="blue"
          change="Con número de rastreo activo"
          trend="neutral"
        />
        <KpiCard
          label="Piezas por Recibir"
          value={`${totalPiezasPendientes} UDS`}
          icon={Package}
          color="amber"
          change="Pendientes de ingreso físico"
          trend="neutral"
        />
        <KpiCard
          label="Recibidas en Kardex"
          value={totalRecibidas}
          icon={CheckCircle2}
          color="emerald"
          change="Stock ya disponible para venta"
          trend="up"
        />
      </div>

      {/* Barra de Filtros y Búsqueda Ejecutiva */}
      <div className="saas-filter-toolbar flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por PO-XXXX, proveedor o producto cotizado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-search-input"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['TODAS', 'EMITIDA', 'EN_TRANSITO', 'RECIBIDA_TOTAL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`saas-pill-tab ${
                statusFilter === st ? 'active' : 'inactive'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <ColumnVisibilityDropdown
          columns={columns}
          onChange={handleColumnChange}
          onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
          onReset={() => setColumns(DEFAULT_PURCHASES_COLUMNS)}
        />
      </div>

      {/* Tabla Principal de Órdenes de Compra (Estilo SaaS Ejecutivo) */}
      <div className="saas-table-container">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              {isColVisible('folio') && <th className="saas-th w-36 whitespace-nowrap">Folio PO</th>}
              {isColVisible('supplier') && <th className="saas-th min-w-[240px]">Fabricante / Proveedor</th>}
              {isColVisible('created_at') && <th className="saas-th text-center w-32 whitespace-nowrap">Fecha Emisión</th>}
              {isColVisible('delivery') && <th className="saas-th text-center w-32 whitespace-nowrap">Promesa Entrega</th>}
              {isColVisible('items') && <th className="saas-th text-center w-32 whitespace-nowrap">Partidas / Piezas</th>}
              {isColVisible('total') && <th className="saas-th text-right w-36 whitespace-nowrap">Importe Total ($ MXN)</th>}
              {isColVisible('status') && <th className="saas-th text-center w-36 whitespace-nowrap">Estado</th>}
              {isColVisible('actions') && <th className="saas-th text-center w-28 whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                  No se encontraron órdenes de compra para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              filtered.map((po) => {
                const isExpanded = expandedPoId === po.id;
                const isReceived = po.status === 'RECIBIDA_TOTAL';

                return (
                  <React.Fragment key={po.id}>
                    <tr className="saas-tr">
                      {/* Folio PO */}
                      {isColVisible('folio') && (
                        <td className="saas-td whitespace-nowrap">
                          <button
                            onClick={() => setExpandedPoId(isExpanded ? null : po.id)}
                            className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 hover:bg-pink-100 transition-colors cursor-pointer"
                          >
                            <span>{po.po_number}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      )}

                      {/* Proveedor */}
                      {isColVisible('supplier') && (
                        <td className="saas-td">
                          <div className="flex items-center gap-2.5 min-w-[220px]">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                              {po.supplier_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-snug">{po.supplier_name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{po.supplier_contact}</p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Fechas */}
                      {isColVisible('created_at') && (
                        <td className="saas-td text-center text-slate-600 text-xs font-medium whitespace-nowrap">{po.created_at}</td>
                      )}
                      {isColVisible('delivery') && (
                        <td className="saas-td text-center font-semibold text-slate-800 text-xs whitespace-nowrap">{po.expected_delivery}</td>
                      )}

                      {/* Piezas */}
                      {isColVisible('items') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {po.items_count} UDS
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">({po.items.length} partidas)</p>
                        </td>
                      )}

                      {/* Importe Total */}
                      {isColVisible('total') && (
                        <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                          ${po.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      )}

                      {/* Estado */}
                      {isColVisible('status') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          <span
                            className={`saas-badge ${
                              isReceived
                                ? 'saas-badge-success'
                                : po.status === 'EN_TRANSITO'
                                ? 'saas-badge-info'
                                : 'saas-badge-warning'
                            }`}
                          >
                            {isReceived ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : po.status === 'EN_TRANSITO' ? (
                              <Truck className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{po.status}</span>
                          </span>
                        </td>
                      )}

                      {/* Acciones */}
                      {isColVisible('actions') && (
                        <td className="saas-td text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isReceived && (
                              <button
                                onClick={() => handleReceiveStock(po)}
                                className="action-btn action-btn-green"
                                title="Ingresar mercancía al Almacén / Kardex"
                              >
                                <PackageCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(po)}
                              className="action-btn action-btn-edit"
                              title="Modificar orden de compra y partidas"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(po.id, po.po_number)}
                              className="action-btn action-btn-delete"
                              title="Eliminar orden de compra"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Fila Desplegable con Tabla de Partidas */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 border-y border-slate-200">
                        <td colSpan={columns.filter((c) => c.visible).length || 1} className="p-4 sm:p-5">
                          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
                            <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider flex items-center gap-2">
                              <Package className="w-4 h-4 text-[#580f36]" />
                              <span>Detalle de Partidas Surtidas en {po.po_number}</span>
                            </h4>

                            <div className="overflow-x-auto">
                              <table className="saas-table">
                                <thead className="saas-thead">
                                  <tr>
                                    <th className="saas-th w-32">SKU</th>
                                    <th className="saas-th min-w-[200px]">Producto</th>
                                    <th className="saas-th w-36">Categoría</th>
                                    <th className="saas-th text-center w-36">Cantidad Solicitada</th>
                                    <th className="saas-th text-right w-36">Costo Unitario ($)</th>
                                    <th className="saas-th text-right w-36">Subtotal ($)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {po.items.map((it, i) => (
                                    <tr key={i} className="saas-tr">
                                      <td className="saas-td font-mono font-bold text-slate-700 text-xs">
                                        {it.sku}
                                      </td>
                                      <td className="saas-td font-bold text-slate-900 text-xs">{it.product_name}</td>
                                      <td className="saas-td text-slate-600 text-xs">{it.category}</td>
                                      <td className="saas-td text-center font-bold text-slate-900 text-xs">
                                        {it.quantity} UDS
                                      </td>
                                      <td className="saas-td text-right font-medium text-slate-700 text-xs">
                                        ${it.unit_cost.toFixed(2)}
                                      </td>
                                      <td className="saas-td text-right font-mono font-bold text-slate-900 text-xs">
                                        ${it.subtotal.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {poList.length} órdenes de compra</span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>Total Compras: <strong className="text-slate-900">${totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
            <span>Recibidas en Kardex: <strong className="text-emerald-700">{totalRecibidas}</strong></span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PRINCIPAL: GENERAR / MODIFICAR ORDEN DE COMPRA     */}
      {/* CONECTADA AL INVENTARIO Y CON TABLA DE PARTIDAS          */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPO ? `Modificar Orden ${editingPO.po_number}` : 'Nueva Orden de Compra (PO)'}
        breadcrumb={['Inicio', 'Compras', editingPO ? 'Modificar Orden' : 'Nueva Orden']}
        size="xl"
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
              onClick={handleSavePO}
              disabled={poItems.length === 0}
              className={`erp-btn-primary ${
                poItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{editingPO ? 'Guardar Cambios' : 'Emitir Orden de Compra (PO)'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePO} className="space-y-6">
              {/* 1. Datos del Proveedor y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Fabricante o Proveedor: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="suppliers-datalist"
                    placeholder="Ej. Química Industrial & Detergentes..."
                    value={supplierName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSupplierName(val);
                      const matched = getStoredSuppliers().find(
                        (s) => s.business_name.toLowerCase() === val.toLowerCase() || s.rfc.toLowerCase() === val.toLowerCase()
                      );
                      if (matched) {
                        setSupplierName(matched.business_name);
                        setSupplierContact(`${matched.contact_name} (${matched.phone}) - ${matched.email}`);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-700"
                  />
                  <datalist id="suppliers-datalist">
                    {getStoredSuppliers().map((sup) => (
                      <option key={sup.id} value={sup.business_name}>
                        {sup.rfc} - {sup.category} ({sup.currency})
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contacto / Teléfono / Correo:
                  </label>
                  <input
                    type="text"
                    placeholder="ventas@proveedor.com / 55-8888-0000"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Fecha Estimada de Entrega:
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 2. Buscador en Vivo de Productos + Botón de Dar de Alta Nuevo */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Seleccionar Productos a Reabastecer desde Inventario:
                  </label>

                  {/* Botón para dar de alta producto nuevo si aún no existe en catálogo */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewProdSku(`PROD-NEW-${Date.now().toString().slice(-4)}`);
                      setNewProdName('');
                      setShowNewProdModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>¿Producto nuevo de proveedor? Darlo de alta en inventario</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Escribe el nombre o SKU del producto a comprar (ej. Cemento, Porcelanato, Lavadora)..."
                    value={prodSearch}
                    onChange={(e) => {
                      setProdSearch(e.target.value);
                      setShowProdDropdown(true);
                    }}
                    onFocus={() => setShowProdDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  />

                  {/* Dropdown de Coincidencias de Inventario */}
                  {showProdDropdown && prodSearch.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {searchedProducts.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                          <p>No se encontró este producto en el inventario actual.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProdSku(`PROD-NEW-${Date.now().toString().slice(-4)}`);
                              setNewProdName(prodSearch);
                              setShowProdDropdown(false);
                              setShowNewProdModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                          >
                            + Dar de alta "{prodSearch}" en catálogo e inventario
                          </button>
                        </div>
                      ) : (
                        searchedProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="p-3 hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  {p.sku}
                                </span>
                                <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{p.category}</span>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-slate-700 text-xs block">
                                Costo Base: ${p.cost.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Stock actual en almacén: <strong>{p.stock} uds</strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-indigo-700 transition-colors"
                            >
                              + Añadir a PO
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Tabla de Partidas de la Orden de Compra */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Partidas a Solicitar ({poItems.length})
                  </span>
                  {poItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPoItems([])}
                      className="text-[11px] text-rose-600 hover:underline font-bold"
                    >
                      Vaciar Partidas
                    </button>
                  )}
                </div>

                {poItems.length === 0 ? (
                  <div className="p-8 text-center bg-white space-y-2">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No hay productos agregados a la orden</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Usa el buscador para seleccionar materiales de almacén o da de alta un producto nuevo con el botón superior.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs bg-white border-collapse">
                      <thead className="bg-slate-100/70 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3 min-w-[200px] border-r border-slate-200">Producto / SKU</th>
                          <th className="p-3 text-center w-28 border-r border-slate-200">Stock Actual</th>
                          <th className="p-3 text-center w-32 border-r border-slate-200">Piezas a Comprar</th>
                          <th className="p-3 text-right w-32 border-r border-slate-200">Costo Unit. ($)</th>
                          <th className="p-3 text-right w-32 border-r border-slate-200">Subtotal ($)</th>
                          <th className="p-3 text-center w-12">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {poItems.map((item, idx) => (
                          <tr key={`${item.product_id}-${idx}`} className="hover:bg-slate-50/50">
                            {/* Producto */}
                            <td className="p-3">
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                {item.sku}
                              </span>
                              <p className="font-bold text-slate-900 mt-0.5 leading-snug">
                                {item.product_name}
                              </p>
                            </td>

                            {/* Stock Actual */}
                            <td className="p-3 text-center">
                              <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                {item.current_stock} en tienda
                              </span>
                            </td>

                            {/* Cantidad a Comprar */}
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItemQty(idx, Number(e.target.value))}
                                className="w-20 px-2 py-1 text-center font-black rounded-lg border border-slate-200 bg-slate-50 text-xs text-indigo-700"
                              />
                            </td>

                            {/* Costo Unitario */}
                            <td className="p-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_cost}
                                onChange={(e) => handleUpdateItemCost(idx, Number(e.target.value))}
                                className="w-24 px-2 py-1 text-right font-bold rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800"
                              />
                            </td>

                            {/* Subtotal Partida */}
                            <td className="p-3 text-right font-black text-slate-900 text-xs">
                              ${item.subtotal.toFixed(2)}
                            </td>

                            {/* Quitar */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Quitar partida"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 4. Resumen Totalizador */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    Total de Partidas Cotizadas: <strong>{poItems.length}</strong>
                  </p>
                  <p>
                    Suma Total de Unidades a Recibir: <strong>{poTotalPieces} piezas</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-bold block uppercase">
                    Costo Total Estimado de Compra:
                  </span>
                  <span className="text-2xl font-black text-indigo-700">
                    ${poTotalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

        </form>
      </ErpModal>

      {/* ======================================================== */}
      {/* MODAL SECUNDARIO: DAR DE ALTA PRODUCTO NUEVO EN CATÁLOGO */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showNewProdModal}
        onClose={() => setShowNewProdModal(false)}
        title="Alta de Producto Nuevo en Inventario"
        breadcrumb={['Inicio', 'Compras', 'Nuevo Producto de Proveedor']}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowNewProdModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleRegisterNewProduct}
              className="erp-btn-primary"
            >
              Dar de Alta & Añadir a PO
            </button>
          </>
        }
      >
        <form onSubmit={handleRegisterNewProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Código SKU Oficial <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newProdSku}
              onChange={(e) => setNewProdSku(e.target.value)}
              className="erp-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre Comercial del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Pegazulejo Gris 20kg Extra Fuerte"
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Categoría / Departamento
            </label>
            <select
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value)}
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
                Costo de Compra ($ MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="1"
                value={newProdCost}
                onChange={(e) => setNewProdCost(Number(e.target.value))}
                className="erp-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Precio Venta Sugerido ($ MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="1"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(Number(e.target.value))}
                className="erp-input font-bold text-black"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            Al confirmar, el producto quedará registrado en el inventario y se agregará inmediatamente como partida de esta orden de compra con stock inicial en 0 hasta su recepción.
          </p>
        </form>
      </ErpModal>
    </div>
  );
};
