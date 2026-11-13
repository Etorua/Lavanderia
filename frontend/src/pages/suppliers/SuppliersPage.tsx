import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { KpiCard } from '../../components/common/KpiCard';
import { ErpModal } from '../../components/common/ErpModal';
import { ColumnVisibilityDropdown, ColumnItem } from '../../components/common/ColumnVisibilityDropdown';
import {
  Supplier,
  getStoredSuppliers,
  saveStoredSuppliers,
} from '../../data/suppliersData';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  DollarSign,
  CreditCard,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileText,
} from 'lucide-react';

const DEFAULT_SUPPLIER_COLUMNS: ColumnItem[] = [
  { id: 'rfc', label: 'RFC / Identificación', visible: true, required: true },
  { id: 'business_name', label: 'Razón Social & Comercial', visible: true, required: true },
  { id: 'contact', label: 'Contacto & Comunicación', visible: true },
  { id: 'location', label: 'Ubicación', visible: true },
  { id: 'currency', label: 'Divisa', visible: true },
  { id: 'credit', label: 'Crédito', visible: true },
  { id: 'status', label: 'Estatus', visible: true },
  { id: 'actions', label: 'Acciones', visible: true, required: true },
];

export const SuppliersPage: React.FC = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>(getStoredSuppliers());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODAS');
  const [currencyFilter, setCurrencyFilter] = useState<'TODAS' | 'MXN' | 'USD'>('TODAS');

  // Visibilidad de Columnas
  const [columns, setColumns] = useState<ColumnItem[]>(DEFAULT_SUPPLIER_COLUMNS);
  const isColVisible = (id: string) => columns.find((c) => c.id === id)?.visible ?? true;
  const handleColumnChange = (id: string, visible: boolean) => {
    setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, visible } : c)));
  };

  // Modal Alta / Edición
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formRfc, setFormRfc] = useState('');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formCommercialName, setFormCommercialName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formTaxRegime, setFormTaxRegime] = useState('601 - General de Ley Personas Morales');
  const [formCurrency, setFormCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [formCreditDays, setFormCreditDays] = useState<number>(30);
  const [formCategory, setFormCategory] = useState('Detergentes & Químicos');

  useEffect(() => {
    saveStoredSuppliers(suppliers);
  }, [suppliers]);

  const categories = [
    'TODAS',
    'Detergentes & Químicos',
    'Empaque & Ganchos',
    'Desmanchadores & Solventes Secos',
    'Refacciones & Planchado',
  ];

  const filtered = suppliers.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.rfc.toLowerCase().includes(term) ||
      s.business_name.toLowerCase().includes(term) ||
      s.commercial_name.toLowerCase().includes(term) ||
      s.contact_name.toLowerCase().includes(term) ||
      s.city.toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'TODAS' || s.category === categoryFilter;
    const matchesCurrency = currencyFilter === 'TODAS' || s.currency === currencyFilter;

    return matchesSearch && matchesCategory && matchesCurrency;
  });

  // KPIs
  const totalSuppliers = suppliers.length;
  const creditSuppliers = suppliers.filter((s) => s.credit_days > 0).length;
  const usdSuppliers = suppliers.filter((s) => s.currency === 'USD').length;
  const activeSuppliers = suppliers.filter((s) => s.is_active).length;

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormRfc('');
    setFormBusinessName('');
    setFormCommercialName('');
    setFormContactName('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCity('Ciudad de México');
    setFormState('CDMX');
    setFormPostalCode('06000');
    setFormTaxRegime('601 - General de Ley Personas Morales');
    setFormCurrency('MXN');
    setFormCreditDays(30);
    setFormCategory('Detergentes & Químicos');
    setShowModal(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormRfc(sup.rfc);
    setFormBusinessName(sup.business_name);
    setFormCommercialName(sup.commercial_name);
    setFormContactName(sup.contact_name);
    setFormEmail(sup.email);
    setFormPhone(sup.phone);
    setFormAddress(sup.address);
    setFormCity(sup.city);
    setFormState(sup.state);
    setFormPostalCode(sup.postal_code);
    setFormTaxRegime(sup.tax_regime);
    setFormCurrency(sup.currency);
    setFormCreditDays(sup.credit_days);
    setFormCategory(sup.category);
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de dar de baja al proveedor "${name}"?`)) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRfc.trim() || !formBusinessName.trim()) {
      alert('Por favor captura el RFC y la Razón Social del proveedor.');
      return;
    }

    const cleanRfc = formRfc.trim().toUpperCase();

    if (editingSupplier) {
      // Editar
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                rfc: cleanRfc,
                business_name: formBusinessName.trim(),
                commercial_name: formCommercialName.trim() || formBusinessName.trim(),
                contact_name: formContactName.trim(),
                email: formEmail.trim(),
                phone: formPhone.trim(),
                address: formAddress.trim(),
                city: formCity.trim(),
                state: formState.trim(),
                postal_code: formPostalCode.trim(),
                tax_regime: formTaxRegime,
                currency: formCurrency,
                credit_days: Number(formCreditDays),
                category: formCategory,
              }
            : s
        )
      );
      alert(`✅ Proveedor "${formBusinessName}" actualizado exitosamente.`);
    } else {
      // Crear
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        rfc: cleanRfc,
        business_name: formBusinessName.trim(),
        commercial_name: formCommercialName.trim() || formBusinessName.trim(),
        contact_name: formContactName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        postal_code: formPostalCode.trim(),
        tax_regime: formTaxRegime,
        currency: formCurrency,
        credit_days: Number(formCreditDays),
        category: formCategory,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0],
      };
      setSuppliers([newSup, ...suppliers]);
      alert(`✅ Proveedor "${formBusinessName}" dado de alta con RFC ${cleanRfc}.`);
    }

    setShowModal(false);
  };

  const isAuthorized = ['COMPRADOR_CORP', 'CONTABILIDAD_CORP', 'CLIENTE_ADMIN', 'SUPERADMIN'].includes(user?.role || '');

  if (!isAuthorized && user?.role.includes('ALMACENISTA')) {
    return (
      <div className="saas-container py-12">
        <div className="max-w-md mx-auto saas-card p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-[#580f36] flex items-center justify-center mx-auto border border-pink-200 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Catálogo de Proveedores (Exclusivo)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            El alta y administración fiscal de <strong>Proveedores</strong> corresponde exclusivamente al <strong>Departamento de Compras</strong> y Contabilidad.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Como <strong>Almacenista</strong>, tus funciones están enfocadas en la administración de <strong>Kardex & Almacén</strong>: recepción física de insumos, registro de entradas (+) y salidas (-).
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
      {/* 1. Header Ejecutivo */}
      <PageHeader
        title="Catálogo Central de Proveedores"
        subtitle="Registro de RFC, razones sociales, condiciones comerciales y crédito para insumos de lavandería & tintorería"
        icon={Building2}
        actions={
          <button onClick={handleOpenCreate} className="btn-primary-wine">
            <Plus className="w-4 h-4 text-pink-200" />
            <span>+ Nuevo Proveedor</span>
          </button>
        }
      />

      {/* 2. KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Proveedores Registrados"
          value={totalSuppliers}
          change="En directorio fiscal central"
          icon={Building2}
          color="wine"
        />
        <KpiCard
          label="Con Línea de Crédito"
          value={creditSuppliers}
          change="Plazos de 15 a 60 días"
          icon={CreditCard}
          color="emerald"
        />
        <KpiCard
          label="Comercio en USD"
          value={usdSuppliers}
          change="Importación solventes"
          icon={DollarSign}
          color="blue"
        />
        <KpiCard
          label="Proveedores Activos"
          value={`${Math.round((activeSuppliers / (totalSuppliers || 1)) * 100)}%`}
          change={`${activeSuppliers} habilitados`}
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="saas-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por RFC, Razón Social, Contacto o Ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="saas-input pl-9 text-xs"
            />
          </div>

          <div className="w-full lg:w-64 relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="saas-select pl-9 text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'TODAS' ? 'Todas las Categorías de Insumo' : c}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-56">
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value as 'TODAS' | 'MXN' | 'USD')}
              className="saas-select text-xs"
            >
              <option value="TODAS">Todas las Divisas (MXN / USD)</option>
              <option value="MXN">Solo Moneda Nacional (MXN)</option>
              <option value="USD">Solo Dólares (USD Importación)</option>
            </select>
          </div>

          <ColumnVisibilityDropdown
            columns={columns}
            onChange={handleColumnChange}
            onShowAll={() => setColumns((prev) => prev.map((c) => ({ ...c, visible: true })))}
            onReset={() => setColumns(DEFAULT_SUPPLIER_COLUMNS)}
          />
        </div>
      </div>

      {/* 4. Tabla de Proveedores (Grid Ejecutivo con Puros Iconos) */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead className="saas-thead">
              <tr>
                {isColVisible('rfc') && <th className="saas-th w-36 whitespace-nowrap">RFC / Identificación</th>}
                {isColVisible('business_name') && <th className="saas-th min-w-[240px]">Razón Social & Comercial</th>}
                {isColVisible('contact') && <th className="saas-th min-w-[200px]">Contacto & Comunicación</th>}
                {isColVisible('location') && <th className="saas-th w-44 whitespace-nowrap">Ubicación</th>}
                {isColVisible('currency') && <th className="saas-th text-center w-24 whitespace-nowrap">Divisa</th>}
                {isColVisible('credit') && <th className="saas-th text-center w-28 whitespace-nowrap">Crédito</th>}
                {isColVisible('status') && <th className="saas-th text-center w-28 whitespace-nowrap">Estatus</th>}
                {isColVisible('actions') && <th className="saas-th text-center w-24 whitespace-nowrap">Acciones</th>}
              </tr>
            </thead>
            <tbody className="saas-tbody">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter((c) => c.visible).length || 1} className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron proveedores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    {/* RFC con estilo monospace distintivo */}
                    {isColVisible('rfc') && (
                      <td className="saas-td whitespace-nowrap">
                        <span className="font-mono text-[11px] font-extrabold text-[#580f36] bg-pink-50 border border-pink-200/60 px-2 py-0.5 rounded tracking-wider">
                          {s.rfc}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1 font-sans">{s.category}</p>
                      </td>
                    )}

                    {/* Razón Social & Comercial */}
                    {isColVisible('business_name') && (
                      <td className="saas-td normal-case">
                        <span className="font-bold text-slate-900 block text-xs leading-snug">
                          {s.business_name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {s.commercial_name !== s.business_name ? s.commercial_name : s.tax_regime}
                        </span>
                      </td>
                    )}

                    {/* Contacto & Comunicación */}
                    {isColVisible('contact') && (
                      <td className="saas-td normal-case">
                        <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                          <span>{s.contact_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {s.phone}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 truncate max-w-[140px]" title={s.email}>
                            <Mail className="w-3 h-3 text-slate-400" />
                            {s.email}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Ubicación */}
                    {isColVisible('location') && (
                      <td className="saas-td normal-case">
                        <span className="text-xs text-slate-800 font-semibold block leading-snug">
                          {s.city}, {s.state}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px] block" title={s.address}>
                          {s.address}
                        </span>
                      </td>
                    )}

                    {/* Divisa */}
                    {isColVisible('currency') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                            s.currency === 'USD'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {s.currency}
                        </span>
                      </td>
                    )}

                    {/* Crédito */}
                    {isColVisible('credit') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-700">
                          {s.credit_days > 0 ? `${s.credit_days} Días` : 'Contado'}
                        </span>
                      </td>
                    )}

                    {/* Estatus */}
                    {isColVisible('status') && (
                      <td className="saas-td text-center whitespace-nowrap">
                        <span className="saas-badge-emerald">ACTIVO</span>
                      </td>
                    )}

                    {/* Acciones: Puros iconos */}
                    <td className="saas-td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="action-btn action-btn-edit"
                          title="Modificar datos fiscales y comerciales del proveedor"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.business_name)}
                          className="action-btn action-btn-delete"
                          title="Dar de baja proveedor del catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="saas-table-footer">
          <span>Mostrando {filtered.length} de {suppliers.length} proveedores registrados</span>
          <span className="text-slate-500 font-medium">
            RFCs vinculados en tiempo real con Cotizaciones & Órdenes de Compra
          </span>
        </div>
      </div>

      {/* 5. Modal ERP: Alta / Edición de Proveedor */}
      <ErpModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? `Editar Proveedor: ${editingSupplier.rfc}` : 'Alta de Nuevo Proveedor de Insumos'}
        breadcrumb={['Inicio', 'Proveedores', editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor']}
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
              onClick={handleSave}
              className="btn-executive-wine"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-pink-50/60 border border-pink-200/70 p-3 rounded-lg flex items-center gap-2.5 text-xs text-[#580f36]">
            <ShieldCheck className="w-5 h-5 text-[#580f36] shrink-0" />
            <span>
              Al registrar el <strong>RFC</strong> y Razón Social, este proveedor aparecerá disponible de inmediato en Cotizaciones y Órdenes de Compra para autocompletar su información.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* RFC */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                RFC (Registro Federal de Contribuyentes) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={13}
                placeholder="Ej. QID080415ML2"
                value={formRfc}
                onChange={(e) => setFormRfc(e.target.value.toUpperCase())}
                className="saas-input font-mono font-bold text-xs uppercase"
              />
            </div>

            {/* Categoría de Insumos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría de Insumo / Giro
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="saas-select text-xs"
              >
                <option value="Detergentes & Químicos">Detergentes & Químicos</option>
                <option value="Empaque & Ganchos">Empaque & Ganchos</option>
                <option value="Desmanchadores & Solventes Secos">Desmanchadores & Solventes Secos</option>
                <option value="Refacciones & Planchado">Refacciones & Planchado</option>
                <option value="Equipamiento & Calderas">Equipamiento & Calderas</option>
              </select>
            </div>

            {/* Razón Social */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Razón Social Fiscal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Química Industrial & Detergentes de México S.A. de C.V."
                value={formBusinessName}
                onChange={(e) => setFormBusinessName(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Nombre Comercial */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Comercial / Marca
              </label>
              <input
                type="text"
                placeholder="Ej. Química Industrial MX"
                value={formCommercialName}
                onChange={(e) => setFormCommercialName(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Persona de Contacto */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Persona de Contacto / Asesor
              </label>
              <input
                type="text"
                placeholder="Ej. Ing. Roberto Santillán"
                value={formContactName}
                onChange={(e) => setFormContactName(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="Ej. 55-8888-0000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="ventas@proveedor.com.mx"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Régimen Fiscal */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Régimen Fiscal (SAT)
              </label>
              <select
                value={formTaxRegime}
                onChange={(e) => setFormTaxRegime(e.target.value)}
                className="saas-select text-xs"
              >
                <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                <option value="612 - Personas Físicas con Actividades Empresariales">612 - Personas Físicas con Actividades Empresariales</option>
                <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                <option value="603 - Personas Morales con Fines no Lucrativos">603 - Personas Morales con Fines no Lucrativos</option>
              </select>
            </div>

            {/* Dirección Fiscal */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dirección Fiscal (Calle, Número, Colonia)
              </label>
              <input
                type="text"
                placeholder="Ej. Av. Industrial Químico #450, Parque Industrial"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ciudad / Municipio
              </label>
              <input
                type="text"
                placeholder="Ej. Toluca"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="saas-input text-xs"
              />
            </div>

            {/* Estado y CP */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  placeholder="Ej. Edo. Méx."
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  C.P.
                </label>
                <input
                  type="text"
                  placeholder="52000"
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>
            </div>

            {/* Divisa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Divisa Comercial Predeterminada
              </label>
              <select
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value as 'MXN' | 'USD')}
                className="saas-select text-xs font-bold"
              >
                <option value="MXN">Pesos Mexicanos (MXN)</option>
                <option value="USD">Dólares Americanos (USD)</option>
              </select>
            </div>

            {/* Días de Crédito */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Plazo de Crédito Comercial
              </label>
              <select
                value={formCreditDays}
                onChange={(e) => setFormCreditDays(Number(e.target.value))}
                className="saas-select text-xs font-bold"
              >
                <option value={0}>0 Días (Pago de Contado)</option>
                <option value={15}>15 Días de Crédito</option>
                <option value={30}>30 Días de Crédito</option>
                <option value={45}>45 Días de Crédito</option>
                <option value={60}>60 Días de Crédito</option>
              </select>
            </div>
          </div>
        </form>
      </ErpModal>
    </div>
  );
};
