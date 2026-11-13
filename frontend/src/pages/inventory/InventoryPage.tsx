import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  WAREHOUSES,
  canViewAllWarehouses,
  getAssignedWarehouseForRole,
} from '../../data/warehouseData';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  History,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Settings,
  DollarSign,
  Building2,
  ShieldAlert,
  Lock,
  MapPin,
} from 'lucide-react';

export interface InventoryItem extends Product {
  location: string;
  warehouse: string;
}

interface KardexMovement {
  id: string;
  folio: string;
  date: string;
  sku: string;
  product_name: string;
  type: 'ENTRADA' | 'SALIDA';
  reason: string;
  quantity: number;
  previous_stock: number;
  current_stock: number;
  user: string;
  warehouse: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  // ==================== ALMACÉN CENTRAL CEDIS (TOLUCA) ====================
  {
    id: 'cedis-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 140,
    reserved_stock: 12,
    in_transit_stock: 50,
    safety_stock: 30,
    min_stock: 40,
    max_stock: 300,
    lead_time_days: 2,
    location: 'Rampa A / Tarima Químicos 01',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 110,
    reserved_stock: 8,
    in_transit_stock: 40,
    safety_stock: 25,
    min_stock: 35,
    max_stock: 250,
    lead_time_days: 3,
    location: 'Rampa A / Tarima Químicos 02',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    price: 1450.0,
    cost: 980.0,
    stock: 55,
    reserved_stock: 5,
    in_transit_stock: 20,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 120,
    lead_time_days: 5,
    location: 'Jaula Bunkers / Químicos Clasificados',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 280,
    reserved_stock: 20,
    in_transit_stock: 100,
    safety_stock: 50,
    min_stock: 80,
    max_stock: 500,
    lead_time_days: 3,
    location: 'Nave 2 / Pasillo Ganchos',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },
  {
    id: 'cedis-p5',
    sku: 'EMP-POL-05',
    qr_code: 'QR-EMP-POL-05',
    name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
    category: 'Empaque & Ganchos',
    price: 890.0,
    cost: 560.0,
    stock: 160,
    reserved_stock: 15,
    in_transit_stock: 60,
    safety_stock: 30,
    min_stock: 50,
    max_stock: 350,
    lead_time_days: 4,
    location: 'Nave 2 / Rack Bobinas',
    warehouse: 'Almacén Central CEDIS (Toluca)',
    is_active: true,
  },

  // ==================== SUCURSAL CENTRO (SUCURSAL ASIGNADA) ====================
  {
    id: 'sc-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SC',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 18,
    reserved_stock: 4,
    in_transit_stock: 10,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 40,
    lead_time_days: 2,
    location: 'Bodega Centro / Pasillo Q-01',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02-SC',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 14,
    reserved_stock: 2,
    in_transit_stock: 8,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 35,
    lead_time_days: 3,
    location: 'Bodega Centro / Pasillo Q-02',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p3',
    sku: 'TINT-SOLV-03',
    qr_code: 'QR-TINT-SOLV-03-SC',
    name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    category: 'Desmanchadores & Solventes Secos',
    price: 1450.0,
    cost: 980.0,
    stock: 6,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 4,
    min_stock: 6,
    max_stock: 20,
    lead_time_days: 5,
    location: 'Jaula Solventes Centro / Anaquel 1',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04-SC',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 32,
    reserved_stock: 6,
    in_transit_stock: 15,
    safety_stock: 15,
    min_stock: 20,
    max_stock: 80,
    lead_time_days: 3,
    location: 'Bodega Centro / Tarima E-01',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p5',
    sku: 'EMP-POL-05',
    qr_code: 'QR-EMP-POL-05-SC',
    name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
    category: 'Empaque & Ganchos',
    price: 890.0,
    cost: 560.0,
    stock: 20,
    reserved_stock: 3,
    in_transit_stock: 5,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 50,
    lead_time_days: 4,
    location: 'Bodega Centro / Estante Bobinas',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p6',
    sku: 'DESM-GRAS-06',
    qr_code: 'QR-DESM-GRAS-06-SC',
    name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
    category: 'Desmanchadores & Solventes Secos',
    price: 420.0,
    cost: 240.0,
    stock: 15,
    reserved_stock: 2,
    in_transit_stock: 15,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 30,
    lead_time_days: 3,
    location: 'Mostrador Centro / Repisa Desmanchado',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p7',
    sku: 'EQ-PLANC-07',
    qr_code: 'QR-EQ-PLANC-07-SC',
    name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
    category: 'Refacciones & Planchado',
    price: 320.0,
    cost: 180.0,
    stock: 9,
    reserved_stock: 0,
    in_transit_stock: 5,
    safety_stock: 3,
    min_stock: 5,
    max_stock: 20,
    lead_time_days: 4,
    location: 'Vitrina Refacciones y Calderas Centro',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },
  {
    id: 'sc-p8',
    sku: 'LAV-OXI-10',
    qr_code: 'QR-LAV-OXI-10-SC',
    name: 'Blanqueador Oxigenado Textil en Polvo Saco 25kg (Color Seguro)',
    category: 'Detergentes & Químicos',
    price: 950.0,
    cost: 590.0,
    stock: 16,
    reserved_stock: 3,
    in_transit_stock: 10,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 40,
    lead_time_days: 3,
    location: 'Área Químicos Centro / Tarima',
    warehouse: 'Sucursal Centro',
    is_active: true,
  },

  // ==================== SUCURSAL NORTE (MÓDULO PLAZA) ====================
  {
    id: 'sn-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SN',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 11,
    reserved_stock: 1,
    in_transit_stock: 8,
    safety_stock: 6,
    min_stock: 10,
    max_stock: 30,
    lead_time_days: 2,
    location: 'Almacén Norte / Bodega 1',
    warehouse: 'Sucursal Norte (Módulo Plaza)',
    is_active: true,
  },
  {
    id: 'sn-p4',
    sku: 'EMP-GAN-04',
    qr_code: 'QR-EMP-GAN-04-SN',
    name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    category: 'Empaque & Ganchos',
    price: 485.0,
    cost: 290.0,
    stock: 22,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 10,
    min_stock: 15,
    max_stock: 60,
    lead_time_days: 3,
    location: 'Almacén Norte / Rack Ganchos',
    warehouse: 'Sucursal Norte (Módulo Plaza)',
    is_active: true,
  },

  // ==================== SUCURSAL SUR PERIFÉRICO ====================
  {
    id: 'ss-p1',
    sku: 'LAV-DET-01',
    qr_code: 'QR-LAV-DET-01-SS',
    name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    category: 'Detergentes & Químicos',
    price: 680.0,
    cost: 420.0,
    stock: 19,
    reserved_stock: 2,
    in_transit_stock: 10,
    safety_stock: 8,
    min_stock: 12,
    max_stock: 40,
    lead_time_days: 2,
    location: 'Almacén Sur / Tarima Principal',
    warehouse: 'Sucursal Sur Periférico',
    is_active: true,
  },
  {
    id: 'ss-p2',
    sku: 'LAV-SUAV-02',
    qr_code: 'QR-LAV-SUAV-02-SS',
    name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    category: 'Suavizantes & Neutralizantes',
    price: 540.0,
    cost: 310.0,
    stock: 9,
    reserved_stock: 1,
    in_transit_stock: 5,
    safety_stock: 5,
    min_stock: 8,
    max_stock: 30,
    lead_time_days: 3,
    location: 'Almacén Sur / Estante Químicos',
    warehouse: 'Sucursal Sur Periférico',
    is_active: true,
  },
];

const INITIAL_KARDEX: KardexMovement[] = [
  // CEDIS
  {
    id: 'k-cedis-1',
    folio: 'MOV-CEDIS-001',
    date: '2026-11-08 10:30',
    sku: 'EMP-GAN-04',
    product_name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    type: 'ENTRADA',
    reason: 'Recepción PO-2026-0017 (Guía FEDEX-998822)',
    quantity: 50,
    previous_stock: 230,
    current_stock: 280,
    user: 'Ing. Fernando (CEDIS Central)',
    warehouse: 'Almacén Central CEDIS (Toluca)',
  },
  {
    id: 'k-cedis-2',
    folio: 'MOV-CEDIS-002',
    date: '2026-11-09 11:00',
    sku: 'LAV-DET-01',
    product_name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    type: 'SALIDA',
    reason: 'Traspaso TRASP-2026-0012 enviado a Sucursal Centro',
    quantity: 10,
    previous_stock: 150,
    current_stock: 140,
    user: 'Ing. Fernando (CEDIS Central)',
    warehouse: 'Almacén Central CEDIS (Toluca)',
  },

  // SUCURSAL CENTRO
  {
    id: 'k-sc-1',
    folio: 'MOV-SC-001',
    date: '2026-11-09 13:40',
    sku: 'LAV-DET-01',
    product_name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
    type: 'ENTRADA',
    reason: 'Recepción traspaso TRASP-2026-0012 desde CEDIS Central',
    quantity: 10,
    previous_stock: 8,
    current_stock: 18,
    user: 'Miguel Bodega (Sucursal Centro)',
    warehouse: 'Sucursal Centro',
  },
  {
    id: 'k-sc-2',
    folio: 'MOV-SC-002',
    date: '2026-11-09 15:20',
    sku: 'EMP-GAN-04',
    product_name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    type: 'SALIDA',
    reason: 'Entrega a mostrador para empaque y planchado',
    quantity: 3,
    previous_stock: 35,
    current_stock: 32,
    user: 'Miguel Bodega (Sucursal Centro)',
    warehouse: 'Sucursal Centro',
  },
  {
    id: 'k-sc-3',
    folio: 'MOV-SC-003',
    date: '2026-11-09 16:45',
    sku: 'LAV-SUAV-02',
    product_name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    type: 'SALIDA',
    reason: 'Merma MERMA-2026-0004 por derrame accidental en rampa',
    quantity: 1,
    previous_stock: 15,
    current_stock: 14,
    user: 'Miguel Bodega (Sucursal Centro)',
    warehouse: 'Sucursal Centro',
  },
  {
    id: 'k-sc-4',
    folio: 'MOV-SC-004',
    date: '2026-11-10 09:30',
    sku: 'TINT-SOLV-03',
    product_name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
    type: 'ENTRADA',
    reason: 'Recepción parcial PO-2026-0019 (DHL-EXPRESS-110099)',
    quantity: 5,
    previous_stock: 1,
    current_stock: 6,
    user: 'Miguel Bodega (Sucursal Centro)',
    warehouse: 'Sucursal Centro',
  },

  // SUCURSAL NORTE
  {
    id: 'k-sn-1',
    folio: 'MOV-SN-001',
    date: '2026-11-10 08:30',
    sku: 'EMP-GAN-04',
    product_name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
    type: 'ENTRADA',
    reason: 'Recepción de reposición semanal',
    quantity: 5,
    previous_stock: 17,
    current_stock: 22,
    user: 'Raúl Guardado (Sucursal Norte)',
    warehouse: 'Sucursal Norte (Módulo Plaza)',
  },

  // SUCURSAL SUR
  {
    id: 'k-ss-1',
    folio: 'MOV-SS-001',
    date: '2026-11-09 18:00',
    sku: 'LAV-SUAV-02',
    product_name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
    type: 'SALIDA',
    reason: 'Suministro a lavadoras automáticas industriales',
    quantity: 2,
    previous_stock: 11,
    current_stock: 9,
    user: 'Esteban Mora (Sucursal Sur)',
    warehouse: 'Sucursal Sur Periférico',
  },
];

const DEFAULT_INVENTORY_COLUMNS: ColumnItem[] = [
  { id: 'sku', label: 'SKU / Ubicación', visible: true, required: true },
  { id: 'product', label: 'Producto', visible: true, required: true },
  { id: 'category', label: 'Categoría', visible: true },
  { id: 'stock', label: 'Físico', visible: true },
  { id: 'reserved', label: 'Apartado (48h)', visible: true },
  { id: 'available', label: 'Disponible', visible: true },
  { id: 'minmax', label: 'Mín - Máx', visible: true },
  { id: 'status', label: 'Estado Salud', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

const DEFAULT_KARDEX_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio', visible: true, required: true },
  { id: 'warehouse', label: 'Almacén', visible: true },
  { id: 'date', label: 'Fecha / Hora', visible: true },
  { id: 'type', label: 'Tipo', visible: true },
  { id: 'product', label: 'Producto / SKU', visible: true, required: true },
  { id: 'quantity', label: 'Cantidad', visible: true },
  { id: 'prevStock', label: 'Stock Previo', visible: true },
  { id: 'resultStock', label: 'Stock Resultante', visible: true },
  { id: 'reason', label: 'Motivo / Justificación', visible: true },
  { id: 'user', label: 'Usuario', visible: true },
];

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [kardex, setKardex] = useState<KardexMovement[]>(INITIAL_KARDEX);
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'KARDEX'>('INVENTORY');

  // Column Visibility States
  const [invColumns, setInvColumns] = useState<ColumnItem[]>(DEFAULT_INVENTORY_COLUMNS);
  const isInvColVisible = (id: string) => invColumns.find((c) => c.id === id)?.visible ?? true;
  const handleInvColumnChange = (id: string, visible: boolean) => {
    setInvColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  const [kardexColumns, setKardexColumns] = useState<ColumnItem[]>(DEFAULT_KARDEX_COLUMNS);
  const isKardexColVisible = (id: string) => kardexColumns.find((c) => c.id === id)?.visible ?? true;
  const handleKardexColumnChange = (id: string, visible: boolean) => {
    setKardexColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Control de Acceso por Almacén / Sucursal Asignada
  const userCanViewAll = canViewAllWarehouses(user?.role);
  const userDefaultWarehouse = getAssignedWarehouseForRole(user?.role, user?.branch?.name);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    userCanViewAll ? 'TODOS' : userDefaultWarehouse
  );

  // Sincronizar si cambia el perfil de usuario
  useEffect(() => {
    if (!userCanViewAll) {
      setSelectedWarehouse(userDefaultWarehouse);
    }
  }, [user?.role, user?.branch?.name, userCanViewAll, userDefaultWarehouse]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODAS');

  // Modales
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEditMinMaxModal, setShowEditMinMaxModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  // Formulario Entrada (Agregar productos / sumar stock)
  const [entryProductId, setEntryProductId] = useState('');
  const [entryQty, setEntryQty] = useState<number | ''>(10);
  const [entryReason, setEntryReason] = useState('Recepción de Proveedor');
  const [entryNotes, setEntryNotes] = useState('');

  // Formulario Salida (Sacar productos / restar stock)
  const [exitProductId, setExitProductId] = useState('');
  const [exitQty, setExitQty] = useState<number | ''>(5);
  const [exitReason, setExitReason] = useState('Merma / Daño Físico');
  const [exitNotes, setExitNotes] = useState('');

  // Formulario Modificar Mínimos y Máximos
  const [editMin, setEditMin] = useState<number | ''>(10);
  const [editMax, setEditMax] = useState<number | ''>(50);
  const [editSafety, setEditSafety] = useState<number | ''>(5);
  const [editLeadTime, setEditLeadTime] = useState<number | ''>(3);
  const [editLocation, setEditLocation] = useState('');

  // Formulario Alta de Nuevo Producto
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Detergentes & Químicos');
  const [newPrice, setNewPrice] = useState<number | ''>(500);
  const [newCost, setNewCost] = useState<number | ''>(300);
  const [newInitialStock, setNewInitialStock] = useState<number | ''>(20);
  const [newMinStock, setNewMinStock] = useState<number | ''>(10);
  const [newMaxStock, setNewMaxStock] = useState<number | ''>(100);
  const [newSafetyStock, setNewSafetyStock] = useState<number | ''>(5);
  const [newLocation, setNewLocation] = useState('Pasillo Q-01');
  const [newWarehouse, setNewWarehouse] = useState<string>(
    userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse
  );

  const categories = [
    'TODAS',
    'Detergentes & Químicos',
    'Suavizantes & Neutralizantes',
    'Desmanchadores & Solventes Secos',
    'Empaque & Ganchos',
    'Refacciones & Planchado',
  ];

  // Filtrado de Inventario según búsqueda, categoría y almacén asignado
  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouse.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'TODAS' || item.category === categoryFilter;
    const matchesWh = selectedWarehouse === 'TODOS' || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesCat && matchesWh;
  });

  // Filtrado de Kardex según almacén y búsqueda
  const filteredKardex = kardex.filter((mov) => {
    const matchesSearch =
      mov.product_name.toLowerCase().includes(search.toLowerCase()) ||
      mov.sku.toLowerCase().includes(search.toLowerCase()) ||
      mov.folio.toLowerCase().includes(search.toLowerCase()) ||
      mov.reason.toLowerCase().includes(search.toLowerCase()) ||
      mov.warehouse.toLowerCase().includes(search.toLowerCase());
    const matchesWh = selectedWarehouse === 'TODOS' || mov.warehouse === selectedWarehouse;
    return matchesSearch && matchesWh;
  });

  // Métricas de inventario para el almacén actualmente seleccionado
  const scopedInventory = inventory.filter(
    (item) => selectedWarehouse === 'TODOS' || item.warehouse === selectedWarehouse
  );
  const totalPiezas = scopedInventory.reduce((acc, p) => acc + p.stock, 0);
  const valorTotalAlmacen = scopedInventory.reduce((acc, p) => acc + p.stock * p.cost, 0);
  const totalCriticos = scopedInventory.filter((p) => p.stock - p.reserved_stock <= p.safety_stock).length;
  const totalApartados = scopedInventory.reduce((acc, p) => acc + p.reserved_stock, 0);

  // Apertura de Modales
  const handleOpenEntry = (prod?: InventoryItem) => {
    const target = prod || (filtered.length > 0 ? filtered[0] : null);
    if (!target) return;
    setSelectedProduct(target);
    setEntryProductId(target.id);
    setEntryQty(10);
    setEntryReason('Recepción de Proveedor');
    setEntryNotes('');
    setShowEntryModal(true);
  };

  const handleOpenExit = (prod?: InventoryItem) => {
    const target = prod || (filtered.length > 0 ? filtered[0] : null);
    if (!target) return;
    setSelectedProduct(target);
    setExitProductId(target.id);
    setExitQty(Math.min(5, target.stock));
    setExitReason('Merma / Daño Físico');
    setExitNotes('');
    setShowExitModal(true);
  };

  const handleOpenEditMinMax = (prod: InventoryItem) => {
    setSelectedProduct(prod);
    setEditMin(prod.min_stock);
    setEditMax(prod.max_stock);
    setEditSafety(prod.safety_stock);
    setEditLeadTime(prod.lead_time_days || 3);
    setEditLocation(prod.location);
    setShowEditMinMaxModal(true);
  };

  const handleOpenNewProduct = () => {
    setNewSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewName('');
    setNewCategory('Detergentes & Químicos');
    setNewPrice(500);
    setNewCost(300);
    setNewInitialStock(20);
    setNewMinStock(10);
    setNewMaxStock(100);
    setNewSafetyStock(5);
    setNewLocation('Pasillo A-01 / Estante 1');
    setNewWarehouse(userCanViewAll ? 'Almacén Central CEDIS (Toluca)' : userDefaultWarehouse);
    setShowNewProductModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de dar de baja el producto "${name}" del inventario de almacén?`)) {
      setInventory((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Guardar Entrada de Mercancía
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find((p) => p.id === entryProductId);
    if (!prod || entryQty === '') return;

    const qty = Number(entryQty);
    if (qty <= 0) {
      alert('La cantidad de entrada debe ser mayor a 0.');
      return;
    }

    const prevStock = prod.stock;
    const nextStock = prevStock + qty;

    // Actualizar inventario
    setInventory((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: nextStock } : p))
    );

    // Registrar en Kardex
    const newMovement: KardexMovement = {
      id: `k-${Date.now()}`,
      folio: `MOV-${new Date().getFullYear()}-${String(kardex.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: prod.sku,
      product_name: prod.name,
      type: 'ENTRADA',
      reason: `${entryReason}${entryNotes ? ` (${entryNotes})` : ''}`,
      quantity: qty,
      previous_stock: prevStock,
      current_stock: nextStock,
      user: user?.full_name || 'Almacenista Encargado',
      warehouse: prod.warehouse,
    };
    setKardex([newMovement, ...kardex]);

    alert(`✅ Entrada registrada con éxito: +${qty} unidades añadidas a "${prod.name}" en ${prod.warehouse}. Nuevo stock: ${nextStock}.`);
    setShowEntryModal(false);
  };

  // Guardar Salida de Mercancía
  const handleSaveExit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = inventory.find((p) => p.id === exitProductId);
    if (!prod || exitQty === '') return;

    const qty = Number(exitQty);
    if (qty <= 0) {
      alert('La cantidad de salida debe ser mayor a 0.');
      return;
    }

    if (prod.stock < qty) {
      alert(`Error: No puedes sacar ${qty} unidades. El stock físico actual es de solo ${prod.stock} unidades.`);
      return;
    }

    const prevStock = prod.stock;
    const nextStock = prevStock - qty;

    // Actualizar inventario
    setInventory((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: nextStock } : p))
    );

    // Registrar en Kardex
    const newMovement: KardexMovement = {
      id: `k-${Date.now()}`,
      folio: `MOV-${new Date().getFullYear()}-${String(kardex.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sku: prod.sku,
      product_name: prod.name,
      type: 'SALIDA',
      reason: `${exitReason}${exitNotes ? ` (${exitNotes})` : ''}`,
      quantity: qty,
      previous_stock: prevStock,
      current_stock: nextStock,
      user: user?.full_name || 'Almacenista Encargado',
      warehouse: prod.warehouse,
    };
    setKardex([newMovement, ...kardex]);

    alert(`✅ Salida registrada con éxito: -${qty} unidades retiradas de "${prod.name}" en ${prod.warehouse}. Stock restante: ${nextStock}.`);
    setShowExitModal(false);
  };

  // Guardar Modificación de Parámetros Mínimos y Máximos
  const handleSaveEditMinMax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const min = Number(editMin) || selectedProduct.min_stock;
    const max = Number(editMax) || selectedProduct.max_stock;
    const safety = Number(editSafety) || selectedProduct.safety_stock;
    const lead = Number(editLeadTime) || selectedProduct.lead_time_days || 3;

    if (min >= max) {
      alert('El Stock Mínimo no puede ser mayor o igual al Stock Máximo.');
      return;
    }

    setInventory((prev) =>
      prev.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              min_stock: min,
              max_stock: max,
              safety_stock: safety,
              lead_time_days: lead,
              location: editLocation || p.location,
            }
          : p
      )
    );

    alert(`✅ Parámetros de inventario actualizados para "${selectedProduct.name}": Mín: ${min}, Máx: ${max}, Seguridad: ${safety}.`);
    setShowEditMinMaxModal(false);
  };

  // Guardar Alta de Nuevo Producto
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName) return;

    const initialStock = Number(newInitialStock) || 0;
    const assignedWh = userCanViewAll ? newWarehouse : userDefaultWarehouse;

    const newProdItem: InventoryItem = {
      id: `p-${Date.now()}`,
      sku: newSku.toUpperCase().trim(),
      qr_code: `QR-${newSku.toUpperCase().trim()}`,
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice) || 0,
      cost: Number(newCost) || 0,
      stock: initialStock,
      reserved_stock: 0,
      in_transit_stock: 0,
      safety_stock: Number(newSafetyStock) || 5,
      min_stock: Number(newMinStock) || 10,
      max_stock: Number(newMaxStock) || 100,
      lead_time_days: 3,
      location: newLocation || 'Almacén General',
      warehouse: assignedWh,
      is_active: true,
    };

    setInventory([newProdItem, ...inventory]);

    // Registrar movimiento Kardex inicial
    if (initialStock > 0) {
      const newMovement: KardexMovement = {
        id: `k-${Date.now()}`,
        folio: `MOV-${new Date().getFullYear()}-${String(kardex.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        sku: newProdItem.sku,
        product_name: newProdItem.name,
        type: 'ENTRADA',
        reason: `Inventario inicial de alta de producto en ${assignedWh}`,
        quantity: initialStock,
        previous_stock: 0,
        current_stock: initialStock,
        user: user?.full_name || 'Administrador de Almacén',
        warehouse: assignedWh,
      };
      setKardex([newMovement, ...kardex]);
    }

    alert(`✅ Producto "${newProdItem.name}" dado de alta con éxito en ${assignedWh}.`);
    setShowNewProductModal(false);
  };

  return (
    <div className="saas-container">
      {/* Cabecera Estandarizada Stanza Málaga */}
      <PageHeader
        icon={Package}
        title="Kardex & Almacén Central"
        subtitle="Gestión integral de almacén: entradas, salidas, cálculo de stock disponible y trazabilidad Kardex en tiempo real."
        actions={
          <button
            onClick={handleOpenNewProduct}
            className="btn-primary-wine"
            title="Dar de alta un nuevo producto en catálogo y almacén"
          >
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nuevo Producto</span>
          </button>
        }
      />

      {/* Fila de Tarjetas Ejecutivas (KPIs de Inventario) */}
      {/* Banner de restricción para Almacenista de Sucursal */}
      {!userCanViewAll && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Almacén Operativo ({user?.role}):</strong> Control de inventario físico y movimientos de <strong>{userDefaultWarehouse}</strong>.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Sucursal Asignada
          </span>
        </div>
      )}

      {/* Selector de Almacén (Filtro Superior Ejecutivo) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Almacén Activo:</span>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            disabled={!userCanViewAll}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors ${
              !userCanViewAll
                ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 cursor-pointer shadow-xs'
            }`}
          >
            {userCanViewAll && (
              <option value="TODOS">📦 Todos los Almacenes (Consolidado Corporativo)</option>
            )}
            {WAREHOUSES.map((w) => (
              <option key={w.id} value={w.name}>
                {w.type === 'CEDIS' ? '🏭' : '🏪'} {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Mostrando existencias de:{' '}
            <strong className="text-slate-800">
              {selectedWarehouse === 'TODOS' ? 'Todos los Almacenes (Consolidado)' : selectedWarehouse}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Valorización de Almacén"
          value={`$${valorTotalAlmacen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="wine"
          change={`${inventory.length} SKUs activos`}
          trend="neutral"
        />
        <KpiCard
          label="Piezas Físicas Totales"
          value={`${totalPiezas.toLocaleString('es-MX')} UDS`}
          icon={Layers}
          color="blue"
          change="Existencia física contada"
          trend="neutral"
        />
        <KpiCard
          label="Unidades Apartadas (48h)"
          value={`${totalApartados} UDS`}
          icon={ShieldCheck}
          color="amber"
          change="Bloqueadas para cotizaciones"
          trend="neutral"
        />
        <KpiCard
          label="Líneas en Nivel Crítico"
          value={totalCriticos}
          icon={AlertTriangle}
          color="emerald"
          change={totalCriticos > 0 ? 'Requieren compra urgente' : 'Todo en nivel óptimo'}
          trend={totalCriticos > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Selector de Pestañas (Módulos de Gestión) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'INVENTORY'
              ? 'bg-[#580f36] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Existencias & Almacén ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('KARDEX')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'KARDEX'
              ? 'bg-[#580f36] text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora Kardex ({kardex.length} Movimientos)</span>
        </button>

        <Link
          to="/admin/min-max"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold ml-auto transition-colors border border-slate-200"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
          <span>Abrir Módulo de Máximos y Mínimos &rarr;</span>
        </Link>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: EXISTENCIAS GENERALES Y ALMACÉN                */}
      {/* ======================================================== */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          {/* Barra de Búsqueda y Filtros */}
          <div className="saas-filter-toolbar flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por SKU, producto o pasillo/ubicación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="saas-search-input"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`saas-pill-tab ${
                    categoryFilter === c ? 'active' : 'inactive'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <ColumnVisibilityDropdown
              columns={invColumns}
              onChange={handleInvColumnChange}
              onShowAll={() => setInvColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
              onReset={() => setInvColumns(DEFAULT_INVENTORY_COLUMNS)}
            />
          </div>

          {/* Tabla de Almacén con Diseño SaaS Ejecutivo */}
          <div className="saas-table-container">
            <table className="saas-table">
              <thead className="saas-thead">
                <tr>
                  {isInvColVisible('sku') && <th className="saas-th w-48 whitespace-nowrap">SKU / Ubicación</th>}
                  {isInvColVisible('product') && <th className="saas-th min-w-[240px]">Producto</th>}
                  {isInvColVisible('category') && <th className="saas-th w-36 whitespace-nowrap">Categoría</th>}
                  {isInvColVisible('stock') && <th className="saas-th text-center w-24 whitespace-nowrap">Físico</th>}
                  {isInvColVisible('reserved') && <th className="saas-th text-center w-28 whitespace-nowrap">Apartado (48h)</th>}
                  {isInvColVisible('available') && <th className="saas-th text-center w-24 whitespace-nowrap">Disponible</th>}
                  {isInvColVisible('minmax') && <th className="saas-th text-center w-28 whitespace-nowrap">Mín - Máx</th>}
                  {isInvColVisible('status') && <th className="saas-th text-center w-28 whitespace-nowrap">Estado Salud</th>}
                  {isInvColVisible('actions') && <th className="saas-th text-center w-36 whitespace-nowrap">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={invColumns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                      No se encontraron productos en inventario con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const disponible = p.stock - p.reserved_stock;
                    const isCrit = disponible <= p.safety_stock;
                    const isReorder = disponible <= p.min_stock && !isCrit;
                    const isOver = p.stock >= p.max_stock;

                    return (
                      <tr key={p.id} className="saas-tr">
                        {/* SKU & Ubicación */}
                        {isInvColVisible('sku') && (
                          <td className="saas-td">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-900 font-bold border border-slate-200">
                                {p.sku}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                  p.warehouse.includes('CEDIS')
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {p.warehouse.includes('CEDIS') ? 'CEDIS' : p.warehouse.replace('Sucursal ', '')}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-1 font-medium truncate max-w-[200px]" title={p.location}>
                              📍 {p.location}
                            </span>
                          </td>
                        )}

                        {/* Producto */}
                        {isInvColVisible('product') && (
                          <td className="saas-td">
                            <span className="font-bold text-slate-900 block leading-tight">{p.name}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Costo: ${p.cost.toFixed(2)} &bull; Venta: ${p.price.toFixed(2)}
                            </span>
                          </td>
                        )}

                        {/* Categoría */}
                        {isInvColVisible('category') && (
                          <td className="saas-td text-slate-700 font-semibold text-xs whitespace-nowrap">{p.category}</td>
                        )}

                        {/* Stock Físico */}
                        {isInvColVisible('stock') && (
                          <td className="saas-td text-center font-extrabold text-slate-900 text-xs whitespace-nowrap">
                            {p.stock}
                          </td>
                        )}

                        {/* Apartado */}
                        {isInvColVisible('reserved') && (
                          <td className="saas-td text-center whitespace-nowrap">
                            <span className={`font-bold text-xs ${p.reserved_stock > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                              {p.reserved_stock > 0 ? `-${p.reserved_stock}` : '0'}
                            </span>
                          </td>
                        )}

                        {/* Disponible */}
                        {isInvColVisible('available') && (
                          <td className="saas-td text-center whitespace-nowrap">
                            <span
                              className={`font-mono font-black text-xs px-2 py-0.5 rounded ${
                                disponible <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : isCrit
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {disponible}
                            </span>
                          </td>
                        )}

                        {/* Mín - Máx */}
                        {isInvColVisible('minmax') && (
                          <td className="saas-td text-center font-mono text-[11px] text-slate-600 font-semibold whitespace-nowrap">
                            {p.min_stock} - {p.max_stock}
                          </td>
                        )}

                        {/* Estado Salud */}
                        {isInvColVisible('status') && (
                          <td className="saas-td text-center whitespace-nowrap">
                            <span
                              className={`saas-badge ${
                                disponible <= 0
                                  ? 'saas-badge-danger'
                                  : isCrit || isReorder
                                  ? 'saas-badge-warning'
                                  : isOver
                                  ? 'saas-badge-info'
                                  : 'saas-badge-success'
                              }`}
                            >
                              {disponible <= 0
                                ? 'AGOTADO'
                                : isCrit
                                ? 'CRÍTICO'
                                : isReorder
                                ? 'REORDEN'
                                : isOver
                                ? 'EXCEDENTE'
                                : 'ÓPTIMO'}
                            </span>
                          </td>
                        )}

                        {/* Acciones */}
                        {isInvColVisible('actions') && (
                          <td className="saas-td text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Entrada directa (Meter mercancía) */}
                              <button
                                onClick={() => handleOpenEntry(p)}
                                className="action-btn action-btn-green"
                                title="Meter mercancía / Entrada de almacén"
                              >
                                <ArrowDownRight className="w-4 h-4" />
                              </button>

                              {/* Salida directa (Sacar mercancía) */}
                              <button
                                onClick={() => handleOpenExit(p)}
                                className="action-btn action-btn-amber"
                                title="Sacar mercancía / Salida de almacén"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </button>

                              {/* Editar Producto */}
                              <button
                                onClick={() => handleOpenEditMinMax(p)}
                                className="action-btn action-btn-edit"
                                title="Modificar parámetros y límites del producto"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Eliminar / Baja */}
                              <button
                                onClick={() => handleDelete(p.id, p.name)}
                                className="action-btn action-btn-delete"
                                title="Dar de baja producto de almacén"
                              >
                                <Trash2 className="w-4 h-4" />
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
            <div className="saas-table-footer">
              <span>Mostrando {filtered.length} de {inventory.length} artículos en almacén</span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span>Valor Total: <strong className="text-slate-900">${valorTotalAlmacen.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
                <span>En Reorden / Crítico: <strong className="text-rose-700">{totalCriticos}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: BITÁCORA KARDEX DE ENTRADAS Y SALIDAS           */}
      {/* ======================================================== */}
      {activeTab === 'KARDEX' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white border border-gray-200 rounded-lg gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase">
                  Trazabilidad de Movimientos Kardex en Almacén
                </h3>
                <p className="text-[11px] text-gray-500">
                  Registro secuencial de cada entrada (+) y salida (-) con motivo y saldo resultante.
                </p>
              </div>
            </div>

            <ColumnVisibilityDropdown
              columns={kardexColumns}
              onChange={handleKardexColumnChange}
              onShowAll={() => setKardexColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
              onReset={() => setKardexColumns(DEFAULT_KARDEX_COLUMNS)}
            />
          </div>

          <div className="erp-table-container">
            <table className="erp-table">
              <thead className="erp-thead">
                <tr>
                  {isKardexColVisible('folio') && <th className="erp-th w-32 font-mono whitespace-nowrap">Folio</th>}
                  {isKardexColVisible('warehouse') && <th className="erp-th w-36 text-center whitespace-nowrap">Almacén</th>}
                  {isKardexColVisible('date') && <th className="erp-th w-36 text-center whitespace-nowrap">Fecha / Hora</th>}
                  {isKardexColVisible('type') && <th className="erp-th text-center w-28 whitespace-nowrap">Tipo</th>}
                  {isKardexColVisible('product') && <th className="erp-th min-w-[220px]">Producto / SKU</th>}
                  {isKardexColVisible('quantity') && <th className="erp-th text-center w-24 whitespace-nowrap">Cantidad</th>}
                  {isKardexColVisible('prevStock') && <th className="erp-th text-center w-28 whitespace-nowrap">Stock Previo</th>}
                  {isKardexColVisible('resultStock') && <th className="erp-th text-center w-28 whitespace-nowrap">Stock Resultante</th>}
                  {isKardexColVisible('reason') && <th className="erp-th min-w-[240px]">Motivo / Justificación</th>}
                  {isKardexColVisible('user') && <th className="erp-th w-36 text-left whitespace-nowrap">Usuario</th>}
                </tr>
              </thead>
              <tbody>
                {filteredKardex.map((mov) => (
                  <tr key={mov.id}>
                    {isKardexColVisible('folio') && (
                      <td className="erp-td font-mono font-bold text-gray-900 whitespace-nowrap">
                        {mov.folio}
                      </td>
                    )}

                    {isKardexColVisible('warehouse') && (
                      <td className="erp-td text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          mov.warehouse.includes('CEDIS')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          <Building2 className="w-3 h-3" />
                          {mov.warehouse.includes('CEDIS') ? 'CEDIS Toluca' : mov.warehouse.replace('Sucursal ', '')}
                        </span>
                      </td>
                    )}

                    {isKardexColVisible('date') && (
                      <td className="erp-td text-center text-gray-500 font-medium whitespace-nowrap">
                        {mov.date}
                      </td>
                    )}

                    {isKardexColVisible('type') && (
                      <td className="erp-td text-center whitespace-nowrap">
                        <span
                          className={
                            mov.type === 'ENTRADA'
                              ? 'erp-badge-active'
                              : 'erp-badge-inactive'
                          }
                        >
                          {mov.type === 'ENTRADA' ? '+ ENTRADA' : '- SALIDA'}
                        </span>
                      </td>
                    )}

                    {isKardexColVisible('product') && (
                      <td className="erp-td">
                        <span className="font-bold text-gray-900 block leading-snug">{mov.product_name}</span>
                        <span className="font-mono text-[10px] text-gray-500">{mov.sku}</span>
                      </td>
                    )}

                    {isKardexColVisible('quantity') && (
                      <td className="erp-td text-center font-extrabold text-sm whitespace-nowrap">
                        <span className={mov.type === 'ENTRADA' ? 'text-emerald-700' : 'text-red-700'}>
                          {mov.type === 'ENTRADA' ? `+${mov.quantity}` : `-${mov.quantity}`} uds
                        </span>
                      </td>
                    )}

                    {isKardexColVisible('prevStock') && (
                      <td className="erp-td text-center text-gray-500 font-semibold whitespace-nowrap">
                        {mov.previous_stock} uds
                      </td>
                    )}

                    {isKardexColVisible('resultStock') && (
                      <td className="erp-td text-center font-black text-gray-900 whitespace-nowrap">
                        {mov.current_stock} uds
                      </td>
                    )}

                    {isKardexColVisible('reason') && (
                      <td className="erp-td normal-case text-gray-700 font-medium">
                        {mov.reason}
                      </td>
                    )}

                    {isKardexColVisible('user') && (
                      <td className="erp-td text-left font-medium text-gray-700 whitespace-nowrap">
                        {mov.user}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: REGISTRAR ENTRADA (AGREGAR MERCANCÍA AL STOCK)  */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        title="Registrar Entrada de Mercancía (Kardex +)"
        breadcrumb={['Inicio', 'Kardex', 'Entrada de Mercancía']}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowEntryModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="entry-form"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
            >
              Confirmar Entrada (+)
            </button>
          </div>
        }
      >
        <form id="entry-form" onSubmit={handleSaveEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Producto a Ingresar <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={entryProductId}
              onChange={(e) => setEntryProductId(e.target.value)}
              className="erp-input font-bold"
            >
              {inventory.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Stock actual: {p.stock} uds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cantidad a Ingresar (+) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={entryQty}
                onChange={(e) => setEntryQty(Number(e.target.value))}
                className="erp-input font-black text-center text-lg text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tipo / Concepto de Entrada <span className="text-red-500">*</span>
              </label>
              <select
                value={entryReason}
                onChange={(e) => setEntryReason(e.target.value)}
                className="erp-input"
              >
                <option value="Recepción de Proveedor">Recepción de Proveedor</option>
                <option value="Devolución de Cliente">Devolución de Cliente</option>
                <option value="Ajuste por Conteo Físico (+)">Ajuste por Conteo Físico (+)</option>
                <option value="Traspaso Recibido de Sucursal">Traspaso Recibido de Sucursal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Folio de Factura, Guía o Justificación:
            </label>
            <input
              type="text"
              placeholder="Ej. Factura F-9932, Entrega parcial de distribuidor..."
              value={entryNotes}
              onChange={(e) => setEntryNotes(e.target.value)}
              className="erp-input"
            />
          </div>

          {/* Proyección de Stock */}
          {entryProductId && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs">
              <span className="font-bold text-emerald-900 block">Proyección en Tiempo Real:</span>
              <div className="flex items-center justify-between text-emerald-800 mt-1 font-medium">
                <span>Stock Actual: <strong>{inventory.find((p) => p.id === entryProductId)?.stock || 0} uds</strong></span>
                <span>Ingreso: <strong className="text-emerald-700">+{Number(entryQty) || 0} uds</strong></span>
                <span>Stock Resultante: <strong className="font-extrabold underline">{(inventory.find((p) => p.id === entryProductId)?.stock || 0) + (Number(entryQty) || 0)} uds</strong></span>
              </div>
            </div>
          )}
        </form>
      </ErpModal>

      {/* ======================================================== */}
      {/* MODAL 2: REGISTRAR SALIDA (SACAR MERCANCÍA / MERMAS)     */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Registrar Salida de Mercancía / Merma (Kardex -)"
        breadcrumb={['Inicio', 'Kardex', 'Salida de Mercancía']}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowExitModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="exit-form"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors"
            >
              Confirmar Salida (-)
            </button>
          </div>
        }
      >
        <form id="exit-form" onSubmit={handleSaveExit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Producto a Descontar <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={exitProductId}
              onChange={(e) => setExitProductId(e.target.value)}
              className="erp-input font-bold"
            >
              {inventory.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (Stock físico: {p.stock} uds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cantidad a Retirar (-) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={exitQty}
                onChange={(e) => setExitQty(Number(e.target.value))}
                className="erp-input font-black text-center text-lg text-red-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo de Salida <span className="text-red-500">*</span>
              </label>
              <select
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                className="erp-input"
              >
                <option value="Merma / Daño Físico">Merma / Daño Físico</option>
                <option value="Producto Caducado">Producto Caducado</option>
                <option value="Robo / Extravío Comprobado">Robo / Extravío Comprobado</option>
                <option value="Ajuste Negativo por Conteo">Ajuste Negativo por Conteo</option>
                <option value="Traspaso Enviado a Otra Sucursal">Traspaso Enviado a Otra Sucursal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Detalle o Evidencia de la Merma:
            </label>
            <input
              type="text"
              placeholder="Ej. Bulto roto en bodega, caja dañada con líquido..."
              value={exitNotes}
              onChange={(e) => setExitNotes(e.target.value)}
              className="erp-input"
            />
          </div>

          {/* Proyección de Stock Saliente */}
          {exitProductId && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs">
              <span className="font-bold text-red-900 block">Impacto en Inventario:</span>
              <div className="flex items-center justify-between text-red-800 mt-1 font-medium">
                <span>Stock Actual: <strong>{inventory.find((p) => p.id === exitProductId)?.stock || 0} uds</strong></span>
                <span>Salida: <strong className="text-red-700">-{Number(exitQty) || 0} uds</strong></span>
                <span>Stock Resultante: <strong className="font-extrabold underline">{(inventory.find((p) => p.id === exitProductId)?.stock || 0) - (Number(exitQty) || 0)} uds</strong></span>
              </div>
            </div>
          )}
        </form>
      </ErpModal>

      {/* ======================================================== */}
      {/* MODAL 3: MODIFICAR PARÁMETROS MÍNIMOS Y MÁXIMOS          */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showEditMinMaxModal && !!selectedProduct}
        onClose={() => setShowEditMinMaxModal(false)}
        title="Modificar Parámetros Mínimos, Máximos y Ubicación"
        breadcrumb={['Inicio', 'Kardex', 'Calibración Min/Max']}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowEditMinMaxModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="minmax-form"
              className="erp-btn-primary"
            >
              Guardar Parámetros
            </button>
          </div>
        }
      >
        {selectedProduct && (
          <form id="minmax-form" onSubmit={handleSaveEditMinMax} className="space-y-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
              <p className="font-bold text-gray-900">{selectedProduct.name}</p>
              <p className="text-gray-500 font-mono text-[11px] mt-0.5">
                SKU: {selectedProduct.sku} &bull; Stock físico actual: <strong>{selectedProduct.stock} uds</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ubicación Física en Almacén <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Pasillo B-03 / Estante 4 / Nivel 2"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="erp-input font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Stock Mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editMin}
                  onChange={(e) => setEditMin(Number(e.target.value))}
                  className="erp-input font-bold text-center text-amber-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Punto de reorden</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Seguridad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editSafety}
                  onChange={(e) => setEditSafety(Number(e.target.value))}
                  className="erp-input font-bold text-center text-red-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Fondo de reserva</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Stock Máximo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editMax}
                  onChange={(e) => setEditMax(Number(e.target.value))}
                  className="erp-input font-bold text-center text-blue-700"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">Capacidad tope</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tiempo de Entrega del Proveedor (Lead Time en Días):
              </label>
              <input
                type="number"
                min="1"
                value={editLeadTime}
                onChange={(e) => setEditLeadTime(Number(e.target.value))}
                className="erp-input font-medium"
              />
            </div>
          </form>
        )}
      </ErpModal>

      {/* ======================================================== */}
      {/* MODAL 4: ALTA DE NUEVO PRODUCTO EN CATÁLOGO & ALMACÉN   */}
      {/* ======================================================== */}
      <ErpModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Dar de Alta Nuevo Producto en Almacén"
        breadcrumb={['Inicio', 'Kardex', 'Alta de Producto']}
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowNewProductModal(false)}
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-semibold text-xs rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="new-product-form"
              className="erp-btn-primary"
            >
              Registrar Producto en Inventario
            </button>
          </div>
        }
      >
        <form id="new-product-form" onSubmit={handleSaveNewProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Código SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. PROD-MAT-99"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                className="erp-input font-mono font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Categoría / Departamento <span className="text-red-500">*</span>
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="erp-input"
              >
                <option value="Materiales de Construcción">Materiales de Construcción</option>
                <option value="Herramientas & Maquinaria">Herramientas & Maquinaria</option>
                <option value="Alimentos & Bebidas">Alimentos & Bebidas</option>
                <option value="Iluminación & Hogar">Iluminación & Hogar</option>
                <option value="Pinturas & Recubrimientos">Pinturas & Recubrimientos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre Comercial del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Disco de Corte Diamantado 4.5 pulgadas"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="erp-input font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Costo Unitario ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={newCost}
                onChange={(e) => setNewCost(Number(e.target.value))}
                className="erp-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Precio de Venta ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="erp-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stock Inicial en Almacén <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={newInitialStock}
                onChange={(e) => setNewInitialStock(Number(e.target.value))}
                className="erp-input font-extrabold text-center text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stock Mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={newMinStock}
                onChange={(e) => setNewMinStock(Number(e.target.value))}
                className="erp-input font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stock Seguridad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={newSafetyStock}
                onChange={(e) => setNewSafetyStock(Number(e.target.value))}
                className="erp-input font-bold text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Stock Máximo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={newMaxStock}
                onChange={(e) => setNewMaxStock(Number(e.target.value))}
                className="erp-input font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Almacén / Destino <span className="text-red-500">*</span>
              </label>
              <select
                disabled={!userCanViewAll}
                value={newWarehouse}
                onChange={(e) => setNewWarehouse(e.target.value)}
                className={`erp-input font-bold ${!userCanViewAll ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.type === 'CEDIS' ? '🏭' : '🏪'} {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ubicación Física en Almacén / Tienda:
              </label>
              <input
                type="text"
                placeholder="Ej. Pasillo H-02 / Estante 1 / Nivel Superior"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="erp-input"
              />
            </div>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
