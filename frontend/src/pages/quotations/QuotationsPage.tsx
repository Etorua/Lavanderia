import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Quotation, Product } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { ErpModal } from '../../components/common/ErpModal';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  INITIAL_TAX_ENTITIES,
  getStoredSuppliers,
  TaxEntity,
} from '../../data/suppliersData';
import {
  getStoredQuotations,
  saveStoredQuotations,
  promoteToReservation,
} from '../../data/quotationsData';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShoppingCart,
  Send,
  Calendar,
  Search,
  Filter,
  Pencil,
  Trash2,
  User,
  Phone,
  Package,
  Percent,
  Calculator,
  ShieldCheck,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Globe,
  Receipt,
  Hash,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  BookmarkPlus,
  Eye,
  Printer,
} from 'lucide-react';

// Inventario disponible para cotizar en tiempo real (Lavandería & Tintorería)
const INVENTORY_CATALOG: Product[] = [
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
    price: 520.0,
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
];

export interface QuotationItemRow {
  product: Product;
  quantity: number;
  unit_price: number;
  tax_type: 'IVA_16' | 'EXENTO' | 'IVA_INCLUIDO';
  currency: 'MXN' | 'USD';
  discount_percent: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

const DEMO_QUOTATIONS: Quotation[] = [
  {
    id: 'q-1',
    folio: 'COT-2026-0042',
    client_rfc: 'LSE190822HJ3',
    client_name: 'Lavandería & Tintorería El Sol Express S.A. de C.V.',
    client_contact: 'Lic. Roberto Méndez (55-8888-9999)',
    client_email: 'compras@elsolclean.com.mx',
    client_address: 'Av. Insurgentes Sur #1450, Col. Del Valle, Benito Juárez, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    total: 7888.0,
    status: 'RESERVADA',
    reserves_stock: true,
    reservation_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    items: [
      {
        id: 'qi-1',
        product_id: 'p1',
        quantity: 10,
        unit_price: 680.0,
        tax_type: 'IVA_16',
        tax_amount: 1088.0,
        currency: 'MXN',
        subtotal: 6800.0,
        product: INVENTORY_CATALOG[0],
      },
    ],
  },
  {
    id: 'q-2',
    folio: 'COT-2026-0041',
    client_rfc: 'HSA140210KL5',
    client_name: 'Operadora Hotelera & Suites Alameda S.A. de C.V.',
    client_contact: 'Ing. Carlos Valdés (55-1111-2222)',
    client_email: 'roperia@hotelalameda.com.mx',
    client_address: 'Av. Juárez #52, Centro Histórico, Cuauhtémoc, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    total: 10324.0,
    status: 'CONVERTIDA',
    reserves_stock: false,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    items: [
      {
        id: 'qi-2',
        product_id: 'p5',
        quantity: 10,
        unit_price: 890.0,
        tax_type: 'IVA_16',
        tax_amount: 1424.0,
        currency: 'MXN',
        subtotal: 8900.0,
        product: INVENTORY_CATALOG[4],
      },
    ],
  },
  {
    id: 'q-3',
    folio: 'COT-2026-0040',
    client_rfc: 'TFA180517NM2',
    client_name: 'Tintorería Francesa de Alta Costura S.C.',
    client_contact: 'Mtra. Gabriela Soto (55-4444-7777)',
    client_email: 'contacto@tintoreriafrancesa.mx',
    client_address: 'Campos Elíseos #204, Polanco V Sección, Miguel Hidalgo, CDMX',
    tax_regime: '612 - Personas Físicas con Actividades Empresariales',
    currency: 'MXN',
    total: 8410.0,
    status: 'RESERVADA',
    reserves_stock: true,
    reservation_expires_at: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    items: [
      {
        id: 'qi-3',
        product_id: 'p3',
        quantity: 5,
        unit_price: 1450.0,
        tax_type: 'IVA_16',
        tax_amount: 1160.0,
        currency: 'MXN',
        subtotal: 7250.0,
        product: INVENTORY_CATALOG[2],
      },
    ],
  },
];

const DEFAULT_QUOTATION_COLUMNS: ColumnItem[] = [
  { id: 'folio', label: 'Folio', visible: true, required: true },
  { id: 'client', label: 'Cliente / Razón Social', visible: true, required: true },
  { id: 'date', label: 'Fecha Emisión', visible: true },
  { id: 'currency', label: 'Divisa', visible: true },
  { id: 'total', label: 'Total Presupuestado', visible: true },
  { id: 'status', label: 'Estado', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>(getStoredQuotations());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODAS' | 'RESERVADA' | 'CONVERTIDA' | 'PENDIENTE' | 'CANCELADA'>('TODAS');
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

  // Sincronizar cambios globales con el módulo de reservas
  useEffect(() => {
    const handleSync = () => {
      setQuotations(getStoredQuotations());
    };
    window.addEventListener('quotations_updated', handleSync);
    return () => window.removeEventListener('quotations_updated', handleSync);
  }, []);

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_QUOTATION_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };
  const handleShowAllColumns = () => {
    setColumns((prev) => prev.map((c) => ({ ...c, visible: true })));
  };
  const handleResetColumns = () => {
    setColumns(DEFAULT_QUOTATION_COLUMNS);
  };

  // Modo de vista: 'list' (tabla principal) o 'form' (emisión en página completa, sin pop-ups)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  // Formulario de Cabecera Fiscal / Comercial
  const [clientRfc, setClientRfc] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTaxRegime, setClientTaxRegime] = useState('601 - General de Ley Personas Morales');
  const [quotationCurrency, setQuotationCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [exchangeRate, setExchangeRate] = useState<number>(20.45);
  const [reservesStock, setReservesStock] = useState(true);

  // Autocompletar RFC dropdown
  const [showRfcDropdown, setShowRfcDropdown] = useState(false);

  // Partidas de la Cotización
  const [quotationItems, setQuotationItems] = useState<QuotationItemRow[]>([]);

  // Búsqueda interactiva de productos de inventario
  const [prodSearch, setProdSearch] = useState('');
  const [showProdDropdown, setShowProdDropdown] = useState(false);

  // Descuento Comercial Global
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState<number>(0);

  const { addItem, clearCart } = useCart();
  const navigate = useNavigate();

  // Directorio unificado de entidades fiscales (Clientes + Proveedores)
  const allTaxEntities: TaxEntity[] = [
    ...INITIAL_TAX_ENTITIES,
    ...getStoredSuppliers().map((s) => ({
      rfc: s.rfc,
      business_name: s.business_name,
      commercial_name: s.commercial_name,
      contact_name: s.contact_name,
      email: s.email,
      phone: s.phone,
      address: `${s.address}, ${s.city}, ${s.state}`,
      tax_regime: s.tax_regime,
      currency: s.currency,
      type: 'PROVEEDOR' as const,
    })),
  ];

  // Filtrado de RFCs en tiempo real
  const searchedRfcEntities = allTaxEntities.filter((item, idx, self) => {
    // Unicidad por RFC
    const firstIdx = self.findIndex((x) => x.rfc.toUpperCase() === item.rfc.toUpperCase());
    if (firstIdx !== idx) return false;

    if (!clientRfc.trim()) return true;
    const term = clientRfc.toLowerCase();
    return (
      item.rfc.toLowerCase().includes(term) ||
      item.business_name.toLowerCase().includes(term) ||
      (item.commercial_name && item.commercial_name.toLowerCase().includes(term))
    );
  });

  const handleSelectRfcEntity = (entity: TaxEntity) => {
    setClientRfc(entity.rfc);
    setClientName(entity.business_name);
    setClientContact(`${entity.contact_name} (${entity.phone})`);
    setClientEmail(entity.email);
    setClientAddress(entity.address);
    setClientTaxRegime(entity.tax_regime);
    setQuotationCurrency(entity.currency || 'MXN');
    setShowRfcDropdown(false);
  };

  // Búsqueda de productos en inventario en tiempo real
  const searchedProducts = INVENTORY_CATALOG.filter((p) => {
    if (!prodSearch.trim()) return false;
    const term = prodSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  // Cálculo individual de partida
  const calculateRowValues = (
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    taxType: 'IVA_16' | 'EXENTO' | 'IVA_INCLUIDO'
  ) => {
    const discountedUnitPrice = unitPrice * (1 - discountPercent / 100);
    let subtotal = 0;
    let taxAmount = 0;
    let total = 0;

    if (taxType === 'IVA_16') {
      subtotal = quantity * discountedUnitPrice;
      taxAmount = subtotal * 0.16;
      total = subtotal + taxAmount;
    } else if (taxType === 'EXENTO') {
      subtotal = quantity * discountedUnitPrice;
      taxAmount = 0;
      total = subtotal;
    } else if (taxType === 'IVA_INCLUIDO') {
      total = quantity * discountedUnitPrice;
      subtotal = total / 1.16;
      taxAmount = total - subtotal;
    }

    return { subtotal, taxAmount, total };
  };

  // Agregar producto a la tabla de partidas
  const handleSelectProduct = (product: Product) => {
    const existingIndex = quotationItems.findIndex((it) => it.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...quotationItems];
      const newQty = updated[existingIndex].quantity + 1;
      const { subtotal, taxAmount, total } = calculateRowValues(
        newQty,
        updated[existingIndex].unit_price,
        updated[existingIndex].discount_percent,
        updated[existingIndex].tax_type
      );
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = subtotal;
      updated[existingIndex].tax_amount = taxAmount;
      updated[existingIndex].total = total;
      setQuotationItems(updated);
    } else {
      const { subtotal, taxAmount, total } = calculateRowValues(1, product.price, 0, 'IVA_16');
      const newItem: QuotationItemRow = {
        product,
        quantity: 1,
        unit_price: product.price,
        tax_type: 'IVA_16',
        currency: quotationCurrency,
        discount_percent: 0,
        subtotal,
        tax_amount: taxAmount,
        total,
      };
      setQuotationItems([...quotationItems, newItem]);
    }

    setProdSearch('');
    setShowProdDropdown(false);
  };

  // Modificar cantidad en partida
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...quotationItems];
    const item = updated[index];
    const { subtotal, taxAmount, total } = calculateRowValues(
      newQty,
      item.unit_price,
      item.discount_percent,
      item.tax_type
    );
    item.quantity = newQty;
    item.subtotal = subtotal;
    item.tax_amount = taxAmount;
    item.total = total;
    setQuotationItems(updated);
  };

  // Modificar precio unitario en partida
  const handleUpdatePrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    const updated = [...quotationItems];
    const item = updated[index];
    const { subtotal, taxAmount, total } = calculateRowValues(
      item.quantity,
      newPrice,
      item.discount_percent,
      item.tax_type
    );
    item.unit_price = newPrice;
    item.subtotal = subtotal;
    item.tax_amount = taxAmount;
    item.total = total;
    setQuotationItems(updated);
  };

  // Modificar tipo de impuesto por partida (+16%, Exento, IVA Incluido)
  const handleUpdateTaxType = (index: number, newTaxType: 'IVA_16' | 'EXENTO' | 'IVA_INCLUIDO') => {
    const updated = [...quotationItems];
    const item = updated[index];
    const { subtotal, taxAmount, total } = calculateRowValues(
      item.quantity,
      item.unit_price,
      item.discount_percent,
      newTaxType
    );
    item.tax_type = newTaxType;
    item.subtotal = subtotal;
    item.tax_amount = taxAmount;
    item.total = total;
    setQuotationItems(updated);
  };

  // Modificar divisa por partida
  const handleUpdateCurrency = (index: number, newCurrency: 'MXN' | 'USD') => {
    const updated = [...quotationItems];
    updated[index].currency = newCurrency;
    setQuotationItems(updated);
  };

  // Eliminar partida
  const handleRemoveItem = (index: number) => {
    setQuotationItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Cálculos Financieros Globales
  const rawSubtotal = quotationItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalTaxAmount = quotationItems.reduce((acc, curr) => acc + curr.tax_amount, 0);
  const globalDiscountAmount = (rawSubtotal * globalDiscountPercent) / 100;
  const netSubtotal = Math.max(0, rawSubtotal - globalDiscountAmount);
  const finalCalculatedTotal = Math.max(0, netSubtotal + totalTaxAmount);

  // Apertura de Modales
  const handleOpenCreate = () => {
    setEditingQuotation(null);
    setClientRfc('');
    setClientName('');
    setClientContact('');
    setClientEmail('');
    setClientAddress('');
    setClientTaxRegime('601 - General de Ley Personas Morales');
    setQuotationCurrency('MXN');
    setReservesStock(true);
    setQuotationItems([]);
    setGlobalDiscountPercent(0);
    setViewMode('form');
  };

  const handleOpenEdit = (q: Quotation) => {
    setEditingQuotation(q);
    setClientRfc(q.client_rfc || '');
    setClientName(q.client_name);
    setClientContact(q.client_contact || '');
    setClientEmail(q.client_email || '');
    setClientAddress(q.client_address || '');
    setClientTaxRegime(q.tax_regime || '601 - General de Ley Personas Morales');
    setQuotationCurrency(q.currency || 'MXN');
    setReservesStock(q.reserves_stock);
    setGlobalDiscountPercent(0);

    const mapped: QuotationItemRow[] = q.items.map((it) => {
      const taxType = it.tax_type || 'IVA_16';
      const { subtotal, taxAmount, total } = calculateRowValues(it.quantity, it.unit_price, 0, taxType);
      return {
        product: it.product,
        quantity: it.quantity,
        unit_price: it.unit_price,
        tax_type: taxType,
        currency: it.currency || q.currency || 'MXN',
        discount_percent: 0,
        subtotal,
        tax_amount: taxAmount,
        total,
      };
    });
    setQuotationItems(mapped);

    setViewMode('form');
  };

  const handleDelete = (id: string, folio: string) => {
    if (confirm(`¿Estás seguro de cancelar y eliminar la cotización ${folio}? Se liberará cualquier apartado.`)) {
      const updated = quotations.filter((q) => q.id !== id);
      setQuotations(updated);
      saveStoredQuotations(updated);
    }
  };

  // Pasar cotización al Módulo de Reservas (Apartado físico 48h)
  const handlePassToReservation = (q: Quotation) => {
    const res = promoteToReservation(q.id);
    if (res.success) {
      setQuotations(getStoredQuotations());
      if (confirm(`${res.message}\n\n¿Deseas ir al Módulo de Reservas de Insumos para verificar el apartado físico?`)) {
        navigate('/admin/reservations');
      }
    } else {
      alert(res.message);
    }
  };

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) {
      alert('Por favor ingresa el nombre o razón social del cliente.');
      return;
    }

    if (quotationItems.length === 0) {
      alert('Debes agregar al menos un producto o insumo a las partidas de la cotización.');
      return;
    }

    if (editingQuotation) {
      const updated = quotations.map((q) =>
        q.id === editingQuotation.id
          ? {
              ...q,
              client_rfc: clientRfc.trim().toUpperCase(),
              client_name: clientName,
              client_contact: clientContact,
              client_email: clientEmail,
              client_address: clientAddress,
              tax_regime: clientTaxRegime,
              currency: quotationCurrency,
              total: finalCalculatedTotal,
              reserves_stock: reservesStock,
              items: quotationItems.map((it, idx) => ({
                id: `qi-${idx}-${Date.now()}`,
                product_id: it.product.id,
                quantity: it.quantity,
                unit_price: it.unit_price,
                subtotal: it.subtotal,
                tax_type: it.tax_type,
                tax_amount: it.tax_amount,
                currency: it.currency,
                product: it.product,
              })),
            }
          : q
      );
      setQuotations(updated);
      saveStoredQuotations(updated);
    } else {
      const newFolio = `COT-2026-${String(quotations.length + 43).padStart(4, '0')}`;
      const newQuotation: Quotation = {
        id: `q-${Date.now()}`,
        folio: newFolio,
        client_rfc: clientRfc.trim().toUpperCase(),
        client_name: clientName,
        client_contact: clientContact,
        client_email: clientEmail,
        client_address: clientAddress,
        tax_regime: clientTaxRegime,
        currency: quotationCurrency,
        total: finalCalculatedTotal,
        status: reservesStock ? 'RESERVADA' : 'PENDIENTE',
        reserves_stock: reservesStock,
        reservation_expires_at: reservesStock
          ? new Date(Date.now() + 48 * 3600 * 1000).toISOString()
          : null,
        created_at: new Date().toISOString(),
        items: quotationItems.map((it, idx) => ({
          id: `qi-${idx}-${Date.now()}`,
          product_id: it.product.id,
          quantity: it.quantity,
          unit_price: it.unit_price,
          subtotal: it.subtotal,
          tax_type: it.tax_type,
          tax_amount: it.tax_amount,
          currency: it.currency,
          product: it.product,
        })),
      };

      const updated = [newQuotation, ...quotations];
      setQuotations(updated);
      saveStoredQuotations(updated);
      alert(`✅ Cotización ${newFolio} emitida con éxito.`);
    }

    setViewMode('list');
  };

  const filtered = quotations.filter((q) => {
    const term = search.toLowerCase();
    const matchesSearch =
      q.folio.toLowerCase().includes(term) ||
      q.client_name.toLowerCase().includes(term) ||
      (q.client_rfc && q.client_rfc.toLowerCase().includes(term)) ||
      (q.client_contact && q.client_contact.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'TODAS' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeReservationsCount = quotations.filter((q) => q.status === 'RESERVADA').length;
  const convertedCount = quotations.filter((q) => q.status === 'CONVERTIDA').length;
  const totalCotizado = quotations.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="saas-container">
      {viewMode === 'list' ? (
        <>
          {/* 1. Header Ejecutivo - Módulo de Cotizaciones Puras */}
          <PageHeader
        title="Cotizaciones Formales de Clientes"
        subtitle="Emisión y cálculo de presupuestos comerciales y fiscales. Envía cotizaciones aprobadas al Módulo de Reservas (48h)."
        icon={FileText}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/reservations"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Ver Módulo de Reservas &rarr;</span>
            </Link>
            <button onClick={handleOpenCreate} className="btn-primary-wine">
              <Plus className="w-4 h-4 text-pink-200" />
              <span>+ Nueva Cotización</span>
            </button>
          </div>
        }
      />

      {/* 2. KPIs Ejecutivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Cotizado"
          value={`$${totalCotizado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          change="Cartera presupuestada"
          icon={DollarSign}
          color="wine"
        />
        <KpiCard
          label="Cotizaciones Emitidas"
          value={quotations.length}
          change="Histórico comercial"
          icon={FileText}
          color="blue"
        />
        <KpiCard
          label="Pasadas a Reserva (48h)"
          value={activeReservationsCount}
          change="En módulo de apartados"
          icon={Clock}
          color="amber"
        />
        <KpiCard
          label="Convertidas a Venta"
          value={convertedCount}
          change="Cobradas en caja POS"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="saas-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Folio, RFC de cliente/proveedor, Razón Social o Teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input pl-9 text-xs"
            />
          </div>

          <div className="w-full sm:w-64 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="saas-select pl-9 text-xs"
            >
              <option value="TODAS">Todos los Estados</option>
              <option value="PENDIENTE">Pendiente de Aprobación</option>
              <option value="RESERVADA">Pasada a Reserva (48h)</option>
              <option value="CONVERTIDA">Convertida a Venta (POS)</option>
              <option value="CANCELADA">Cancelada / Vencida</option>
            </select>
          </div>

          <ColumnVisibilityDropdown
            columns={columns}
            onChange={handleColumnChange}
            onShowAll={handleShowAllColumns}
            onReset={handleResetColumns}
          />
        </div>
      </div>

      {/* 4. Tabla de Cotizaciones */}
      <div className="saas-card overflow-hidden">
        <table className="saas-table">
          <thead className="saas-thead">
            <tr>
              {isColVisible('folio') && <th className="saas-th w-36 whitespace-nowrap">Folio</th>}
              {isColVisible('client') && <th className="saas-th min-w-[320px]">Cliente / Razón Social</th>}
              {isColVisible('date') && <th className="saas-th w-32 text-center whitespace-nowrap">Fecha Emisión</th>}
              {isColVisible('currency') && <th className="saas-th w-24 text-center whitespace-nowrap">Divisa</th>}
              {isColVisible('total') && <th className="saas-th w-36 text-right whitespace-nowrap">Total Presupuestado</th>}
              {isColVisible('status') && <th className="saas-th w-36 text-center whitespace-nowrap">Estado</th>}
              {isColVisible('actions') && <th className="saas-th w-36 text-center whitespace-nowrap">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.filter((c) => c.visible).length || 1} className="saas-td text-center py-12 text-slate-400 font-medium">
                  No se encontraron cotizaciones para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((q) => {
                const isReserved = q.status === 'RESERVADA';
                const isConverted = q.status === 'CONVERTIDA';

                return (
                  <tr key={q.id} className="saas-tr">
                    {isColVisible('folio') && (
                      <td className="saas-td whitespace-nowrap">
                        <button
                          onClick={() => setPreviewQuotation(q)}
                          className="font-mono text-xs font-bold text-[#580f36] bg-pink-50 hover:bg-pink-100 border border-pink-200/60 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                          title="Clic para ver documento oficial de cotización con partidas"
                        >
                          {q.folio}
                        </button>
                      </td>
                    )}

                    {isColVisible('client') && (
                      <td className="saas-td">
                        <div className="min-w-[320px]">
                          <div className="flex items-center gap-2 mb-1">
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

                    {isColVisible('date') && (
                      <td className="saas-td text-center text-slate-600 text-xs font-medium whitespace-nowrap">
                        {new Date(q.created_at).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    )}

                    {isColVisible('currency') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                            q.currency === 'USD'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {q.currency || 'MXN'}
                        </span>
                      </td>
                    )}

                    {isColVisible('total') && (
                      <td className="saas-td text-right font-mono font-extrabold text-slate-900 text-xs whitespace-nowrap">
                        ${q.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    )}

                    {isColVisible('status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`saas-badge ${
                            isConverted
                              ? 'saas-badge-success'
                              : isReserved
                              ? 'saas-badge-warning'
                              : 'saas-badge-info'
                          }`}
                        >
                          {isConverted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isReserved ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span>{q.status}</span>
                        </span>
                      </td>
                    )}

                    {/* Acciones: Ver Documento / Pasar a Reserva / Editar / Eliminar */}
                    {isColVisible('actions') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Ver Documento Oficial de Cotización */}
                          <button
                            onClick={() => setPreviewQuotation(q)}
                            className="action-btn action-btn-view"
                            title="Ver documento oficial de cotización con partidas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Botón para pasar a Módulo de Reservas */}
                          {q.status !== 'RESERVADA' && q.status !== 'CONVERTIDA' && (
                            <button
                              onClick={() => handlePassToReservation(q)}
                              className="action-btn action-btn-amber"
                              title="Pasar al Módulo de Reservas (Apartado físico 48h)"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {isReserved && (
                            <button
                              onClick={() => navigate('/admin/reservations')}
                              className="action-btn action-btn-amber"
                              title="Ver apartado en el Módulo de Reservas"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {isConverted && (
                            <span
                              className="action-btn action-btn-green"
                              title="Cotización ya cobrada en caja POS"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}

                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="action-btn action-btn-edit"
                            title="Modificar cotización y partidas"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q.id, q.folio)}
                            className="action-btn action-btn-delete"
                            title="Eliminar cotización"
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
          <span>Mostrando {filtered.length} de {quotations.length} cotizaciones registradas</span>
          <span className="text-slate-500 font-medium">
            Reserva con candado bloquea automáticamente el inventario en almacén y mostrador
          </span>
        </div>
      </div>
    </>
  ) : (
    /* ======================================================== */
    /* VISTA COMPLETA: EMISIÓN DE COTIZACIÓN (SIN POP-UPS)      */
    /* ======================================================== */
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera Superior Integrada de Cotización */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Volver a la lista de cotizaciones"
          >
            <ArrowLeft className="w-4 h-4 text-[#580f36]" />
            <span>Volver al Listado</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>{editingQuotation ? `Modificar Cotización ${editingQuotation.folio}` : 'Nueva Cotización Formal de Insumos & Equipamiento'}</span>
              <span className="text-xs bg-pink-100 text-[#580f36] px-2.5 py-0.5 rounded-full font-bold">
                {editingQuotation ? 'Edición Formal' : 'Emisión Oficial'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Presupuesto comercial con cálculo automático de IVA (16%), catálogo de insumos y candado de reserva por 48 horas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={quotationItems.length === 0}
            className={`px-5 py-2.5 bg-[#580f36] hover:bg-[#430b29] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98`}
          >
            <FileText className="w-4 h-4 text-pink-200" />
            <span>
              {editingQuotation
                ? 'Actualizar Cotización'
                : reservesStock
                ? 'Emitir Cotización con Reserva (48h)'
                : 'Emitir Cotización'}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveQuotation} className="space-y-6">
          {/* 1. Datos Fiscales con Buscador Inteligente por RFC */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#580f36]" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Datos Fiscales del Cliente / Empresa
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Campo RFC con Autocompletado */}
              <div className="sm:col-span-4 relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  RFC (Buscar o Escribir) <span className="text-pink-700">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. LSE190822HJ3..."
                    maxLength={13}
                    value={clientRfc}
                    onChange={(e) => {
                      setClientRfc(e.target.value.toUpperCase());
                      setShowRfcDropdown(true);
                    }}
                    onFocus={() => setShowRfcDropdown(true)}
                    className="saas-input pl-8 font-mono font-bold text-xs uppercase"
                  />
                </div>

                {/* Dropdown de RFCs coincidentes */}
                {showRfcDropdown && searchedRfcEntities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-40 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Selecciona un RFC registrado para autocompletar:
                    </div>
                    {searchedRfcEntities.map((ent) => (
                      <div
                        key={ent.rfc}
                        onClick={() => handleSelectRfcEntity(ent)}
                        className="p-2.5 hover:bg-pink-50/70 cursor-pointer text-left transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-[#580f36]">
                            {ent.rfc}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              ent.type === 'CLIENTE'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {ent.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">
                          {ent.business_name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{ent.phone} • {ent.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Razón Social */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cliente o Razón Social Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lavandería & Tintorería El Sol Express S.A. de C.V."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>

              {/* Teléfono o Contacto */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persona o Teléfono de Contacto
                </label>
                <input
                  type="text"
                  placeholder="55-1234-5678 / Lic. Méndez"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>

              {/* Correo Electrónico */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo para Facturación / Envío
                </label>
                <input
                  type="email"
                  placeholder="compras@cliente.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>

              {/* Divisa de Cotización */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Divisa del Presupuesto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={quotationCurrency}
                    onChange={(e) => {
                      const cur = e.target.value as 'MXN' | 'USD';
                      setQuotationCurrency(cur);
                      setQuotationItems((prev) =>
                        prev.map((it) => ({ ...it, currency: cur }))
                      );
                    }}
                    className="saas-select text-xs font-bold"
                  >
                    <option value="MXN">MXN ($)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    title="Tipo de cambio oficial"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="saas-input text-xs text-right font-mono"
                    placeholder="T.C. 20.45"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Buscador en Vivo de Insumos de Lavandería */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Buscar y Agregar Insumos al Presupuesto
              </label>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Catálogo sincronizado en tiempo real
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Escribe el nombre del producto, SKU o categoría (ej. Detergente, Percloroetileno, Ganchos, Polietileno)..."
                value={prodSearch}
                onChange={(e) => {
                  setProdSearch(e.target.value);
                  setShowProdDropdown(true);
                }}
                onFocus={() => setShowProdDropdown(true)}
                className="saas-input pl-10 text-xs"
              />
            </div>

            {/* Dropdown de Resultados de Búsqueda */}
            {showProdDropdown && prodSearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchedProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No se encontró ningún insumo en almacén con ese nombre o SKU.
                  </div>
                ) : (
                  searchedProducts.map((p) => {
                    const available = p.stock - p.reserved_stock;
                    const inStock = available > 0;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-pink-50 text-[#580f36] px-1.5 py-0.5 rounded border border-pink-200/60">
                              {p.sku}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{p.category}</span>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-xs block">
                            ${p.price.toFixed(2)} {quotationCurrency}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              inStock ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {inStock ? `${available} disponibles` : 'Sin existencias'}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-executive-wine py-1 px-3 text-xs"
                        >
                          + Agregar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* 3. Tabla de Partidas con Columnas y Filas Delimitadas (Petición Exacta del Usuario) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs bg-white">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                  Partidas de la Cotización ({quotationItems.length})
                </span>
              </div>
              {quotationItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuotationItems([])}
                  className="text-[11px] text-red-600 hover:text-red-800 hover:underline font-bold uppercase"
                >
                  Vaciar Partidas
                </button>
              )}
            </div>

            {quotationItems.length === 0 ? (
              <div className="p-8 text-center bg-white space-y-2">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No hay productos agregados todavía</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Usa el buscador de arriba para seleccionar insumos, detergentes o ganchos y agregarlos a esta cotización.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-300 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12 border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 w-32 border-r border-slate-200">Nº Producto / SKU</th>
                      <th className="py-2.5 px-3 min-w-[200px] border-r border-slate-200">Descripción del Insumo</th>
                      <th className="py-2.5 px-3 text-center w-24 border-r border-slate-200">Cantidad</th>
                      <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200">Precio Unit.</th>
                      <th className="py-2.5 px-3 text-center w-36 border-r border-slate-200">+IVA / Exento</th>
                      <th className="py-2.5 px-3 text-center w-20 border-r border-slate-200">Divisa</th>
                      <th className="py-2.5 px-3 text-right w-28 border-r border-slate-200">Importe Total</th>
                      <th className="py-2.5 px-2 text-center w-12">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {quotationItems.map((item, idx) => {
                      const available = item.product.stock - item.product.reserved_stock;
                      const exceedsStock = item.quantity > available;

                      return (
                        <tr key={`${item.product.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          {/* Columna 1: Número de Renglón (#) */}
                          <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200 bg-slate-50/40">
                            {idx + 1}
                          </td>

                          {/* Columna 2: Número de Producto / SKU */}
                          <td className="py-2 px-3 border-r border-slate-200">
                            <span className="font-mono text-[11px] bg-pink-50 text-[#580f36] px-2 py-0.5 rounded font-extrabold border border-pink-200/70 inline-block">
                              {item.product.sku}
                            </span>
                          </td>

                          {/* Columna 3: Descripción del Insumo & Stock */}
                          <td className="py-2 px-3 border-r border-slate-200 normal-case">
                            <p className="font-bold text-slate-900 text-xs">
                              {item.product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                              <span className="text-slate-400">{item.product.category}</span>
                              <span className="text-slate-300">•</span>
                              <span className={available > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                                {available} en almacén
                              </span>
                            </div>
                          </td>

                          {/* Columna 4: Cantidad */}
                          <td className="py-2 px-3 text-center border-r border-slate-200">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQty(idx, Number(e.target.value))}
                              className={`w-18 px-2 py-1 text-center font-bold rounded border text-xs ${
                                exceedsStock
                                  ? 'border-red-400 bg-red-50 text-red-800'
                                  : 'border-slate-300 bg-white text-slate-900'
                              }`}
                            />
                            {exceedsStock && (
                              <span className="text-[9px] text-red-600 font-bold block mt-0.5">
                                Excede stock
                              </span>
                            )}
                          </td>

                          {/* Columna 5: Precio Unitario Editable */}
                          <td className="py-2 px-3 text-right border-r border-slate-200">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unit_price}
                                onChange={(e) => handleUpdatePrice(idx, Number(e.target.value))}
                                className="w-24 pl-5 pr-2 py-1 text-right font-bold rounded border border-slate-300 bg-white text-xs text-slate-900"
                              />
                            </div>
                          </td>

                          {/* Columna 6: Régimen de Impuesto (+IVA 16%, Exento, IVA Incluido) */}
                          <td className="py-2 px-3 text-center border-r border-slate-200">
                            <select
                              value={item.tax_type}
                              onChange={(e) =>
                                handleUpdateTaxType(
                                  idx,
                                  e.target.value as 'IVA_16' | 'EXENTO' | 'IVA_INCLUIDO'
                                )
                              }
                              className={`text-[11px] font-bold rounded px-2 py-1 border cursor-pointer ${
                                item.tax_type === 'IVA_16'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : item.tax_type === 'EXENTO'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-blue-50 text-blue-800 border-blue-300'
                              }`}
                            >
                              <option value="IVA_16">+ 16% IVA</option>
                              <option value="EXENTO">Exento (0%)</option>
                              <option value="IVA_INCLUIDO">IVA Incluido</option>
                            </select>
                            {item.tax_amount > 0 && (
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                +${item.tax_amount.toFixed(2)} IVA
                              </span>
                            )}
                          </td>

                          {/* Columna 7: Divisa */}
                          <td className="py-2 px-3 text-center border-r border-slate-200">
                            <select
                              value={item.currency}
                              onChange={(e) => handleUpdateCurrency(idx, e.target.value as 'MXN' | 'USD')}
                              className="text-[11px] font-black rounded px-1.5 py-1 border border-slate-300 bg-white cursor-pointer"
                            >
                              <option value="MXN">MXN</option>
                              <option value="USD">USD</option>
                            </select>
                          </td>

                          {/* Columna 8: Importe Total */}
                          <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900 text-xs border-r border-slate-200">
                            ${item.total.toFixed(2)}
                          </td>

                          {/* Columna 9: Acciones (Puro Icono) */}
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="w-7 h-7 flex items-center justify-center rounded text-rose-500 hover:bg-rose-50 transition-colors mx-auto cursor-pointer"
                              title="Quitar partida de la cotización"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Bloque Inferior: Descuento Comercial, Impuestos y Resumen Financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
            {/* Opciones Comerciales y Descuentos */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descuento Comercial Global (%):
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={globalDiscountPercent}
                    onChange={(e) => setGlobalDiscountPercent(Number(e.target.value))}
                    className="saas-input w-24 font-bold text-amber-700 text-xs"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    {globalDiscountPercent > 0
                      ? `(-$${globalDiscountAmount.toFixed(2)} ${quotationCurrency})`
                      : 'Sin descuento adicional'}
                  </span>
                </div>
              </div>

              {/* Apartado de Stock 48h */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reservesStock}
                    onChange={(e) => setReservesStock(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Apartar inventario físico con candado de 48 horas
                    </span>
                    <span className="text-[11px] text-amber-800 font-normal leading-relaxed block mt-0.5">
                      Garantiza las existencias cotizadas en mostrador para que otros cajeros no puedan venderlas mientras el cliente concreta el pago.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Resumen Financiero Totalizador */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-2">
                Resumen Financiero del Presupuesto
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Suma de Partidas (Base):</span>
                  <span className="font-mono font-bold">${rawSubtotal.toFixed(2)} {quotationCurrency}</span>
                </div>

                {globalDiscountPercent > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Descuento Global ({globalDiscountPercent}%):</span>
                    <span className="font-mono">-${globalDiscountAmount.toFixed(2)} {quotationCurrency}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Impuestos Trasladados (IVA):</span>
                  <span className="font-mono font-bold">${totalTaxAmount.toFixed(2)} {quotationCurrency}</span>
                </div>

                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">TOTAL FINAL:</span>
                    <span className="text-[10px] text-slate-500">
                      En {quotationCurrency === 'MXN' ? 'Pesos Mexicanos (MXN)' : 'Dólares Americanos (USD)'}
                    </span>
                  </div>
                  <span className="font-mono text-xl font-black text-[#580f36]">
                    ${finalCalculatedTotal.toFixed(2)} {quotationCurrency}
                  </span>
                </div>

                {quotationCurrency === 'USD' && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 text-right">
                    <span>Equivalente en MXN: </span>
                    <strong className="font-mono">${(finalCalculatedTotal * exchangeRate).toFixed(2)} MXN</strong>
                    <span className="text-blue-700 block text-[10px]">Tipo de cambio: ${exchangeRate.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
            {/* Barra de Acciones Inferiores en Pantalla Completa */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar y Volver al Listado
              </button>

              <button
                type="button"
                onClick={handleSaveQuotation}
                disabled={quotationItems.length === 0}
                className="px-6 py-2.5 bg-[#580f36] hover:bg-[#430b29] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <FileText className="w-4 h-4 text-pink-200" />
                <span>
                  {editingQuotation
                    ? 'Actualizar Cotización'
                    : reservesStock
                    ? 'Emitir Cotización con Reserva (48h)'
                    : 'Emitir Cotización'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DOCUMENTO FORMAL DE COTIZACIÓN (HOJA MEMBRETADA)  */}
      {/* ======================================================== */}
      {previewQuotation && (
        <ErpModal
          isOpen={!!previewQuotation}
          onClose={() => setPreviewQuotation(null)}
          title={`Documento Oficial: Cotización ${previewQuotation.folio}`}
          breadcrumb={['Inicio', 'Cotizaciones', previewQuotation.folio]}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-executive-secondary flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                {previewQuotation.status !== 'RESERVADA' && previewQuotation.status !== 'CONVERTIDA' && (
                  <button
                    type="button"
                    onClick={() => {
                      const q = previewQuotation;
                      setPreviewQuotation(null);
                      handlePassToReservation(q);
                    }}
                    className="btn-executive-wine flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Pasar a Módulo de Reservas (48h)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewQuotation(null)}
                  className="btn-executive-secondary"
                >
                  Cerrar Documento
                </button>
              </div>
            </div>
          }
        >
          {/* Documento membretado formal */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-800 space-y-6">
            {/* Cabecera / Hoja Membretada */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#580f36] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  LP
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">LAVACLEAN PRO DE MÉXICO</h3>
                  <p className="text-xs text-slate-500 font-medium">Soluciones Químicas, Insumos & Maquinaria para Tintorerías y Lavanderías</p>
                  <p className="text-[11px] font-mono text-slate-400">RFC: LCP180415TX9 &bull; Régimen 601 General de Ley Personas Morales</p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 border border-slate-200 p-3 rounded-lg min-w-[210px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COTIZACIÓN COMERCIAL</span>
                <span className="font-mono text-lg font-extrabold text-[#580f36] block">{previewQuotation.folio}</span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Fecha: {new Date(previewQuotation.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-[11px] text-amber-700 font-medium block">
                  Vigencia: 15 días naturales
                </span>
              </div>
            </div>

            {/* Datos del Cliente Receptor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">DATOS FISCALES DEL CLIENTE</span>
                <p className="font-extrabold text-slate-900 text-sm">{previewQuotation.client_name}</p>
                <p className="text-slate-600 mt-1">
                  <span className="font-semibold text-slate-700">RFC:</span> {previewQuotation.client_rfc || 'Público en General'}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Régimen:</span> {previewQuotation.tax_regime || 'General'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CONTACTO & ENTREGA</span>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Atención:</span> {previewQuotation.client_contact || 'No especificado'}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Correo:</span> {previewQuotation.client_email || 'No especificado'}
                </p>
                <p className="text-slate-600 truncate">
                  <span className="font-semibold text-slate-700">Domicilio:</span> {previewQuotation.client_address || 'No registrado'}
                </p>
              </div>
            </div>

            {/* TABLA FORMAL DE ARTÍCULOS COTIZADOS EN EL DOCUMENTO */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#580f36]" />
                  <span>Artículos y Partidas Cotizadas ({previewQuotation.items.length})</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">Divisa: <strong className="text-slate-800">{previewQuotation.currency || 'MXN'}</strong></span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3 w-28">SKU</th>
                      <th className="py-2.5 px-3">Descripción del Insumo / Producto</th>
                      <th className="py-2.5 px-3 w-20 text-center">Cant.</th>
                      <th className="py-2.5 px-3 w-28 text-right">P. Unitario</th>
                      <th className="py-2.5 px-3 w-24 text-center">Impuesto</th>
                      <th className="py-2.5 px-3 w-32 text-right">Importe Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewQuotation.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#580f36]">{it.product.sku}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{it.product.name}</p>
                          <p className="text-[11px] text-slate-500">{it.product.category}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center font-extrabold text-slate-900">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">
                          ${it.unit_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {it.tax_type === 'EXENTO' ? 'Exento' : 'IVA 16%'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                          ${it.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen Financiero y Términos Comerciales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Términos & Condiciones Comerciales</p>
                <p>&bull; Precios vigentes por 15 días naturales a partir de la fecha de emisión.</p>
                <p>&bull; La cotización no reserva inventario físico salvo que sea procesada en el <strong>Módulo de Reservas (48h)</strong>.</p>
                <p>&bull; Formas de pago aceptadas: Transferencia SPEI, Tarjeta Bancaria y Efectivo en caja POS.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Partidas:</span>
                  <span className="font-mono font-bold">${(previewQuotation.total / 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {previewQuotation.currency || 'MXN'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA Trasladado (16%):</span>
                  <span className="font-mono font-bold">${(previewQuotation.total - (previewQuotation.total / 1.16)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {previewQuotation.currency || 'MXN'}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-slate-900">Total Presupuestado:</span>
                  <span className="text-lg font-mono font-extrabold text-[#580f36]">
                    ${previewQuotation.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} {previewQuotation.currency || 'MXN'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ErpModal>
      )}
    </div>
  );
};
