import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getStoredTickets,
  saveBilledInvoice,
  CounterTicket,
  BilledInvoice,
  generateSatXmlString,
} from '../../data/billingData';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Mail,
  Printer,
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  QrCode,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react';

const SAT_REGIMENES = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '621 - Incorporación Fiscal',
  '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626 - Régimen Simplificado de Confianza (RESICO)',
  '616 - Sin obligaciones fiscales',
];

const SAT_USOS_CFDI = [
  'G01 - Adquisición de mercancías',
  'G02 - Devoluciones, descuentos o bonificaciones',
  'G03 - Gastos en general',
  'I01 - Construcciones',
  'I04 - Equipo de computo y accesorios',
  'I08 - Otra maquinaria y equipo',
  'S01 - Sin efectos fiscales',
  'CP01 - Pagos',
];

export const OnlineBillingPage: React.FC = () => {
  // Pasos: 1 = Buscar Ticket, 2 = Datos Fiscales, 3 = Descarga / Éxito
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Formulario Paso 1
  const [ticketFolio, setTicketFolio] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<CounterTicket | null>(null);

  // Formulario Paso 2 (CFDI 4.0)
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState(SAT_REGIMENES[0]);
  const [usoCfdi, setUsoCfdi] = useState(SAT_USOS_CFDI[0]);
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Factura Generada (Paso 3)
  const [generatedInvoice, setGeneratedInvoice] = useState<BilledInvoice | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const tickets = getStoredTickets();

  // Validación y Búsqueda de Ticket
  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);

    const cleanFolio = ticketFolio.trim().toUpperCase();
    if (!cleanFolio) {
      setTicketError('Por favor ingresa el número de ticket o folio de venta.');
      return;
    }

    const found = tickets.find((t) => t.folio.toUpperCase() === cleanFolio);
    if (!found) {
      setTicketError(`No se encontró ningún ticket con el folio "${cleanFolio}". Verifica tu comprobante de compra.`);
      return;
    }

    if (found.isBilled) {
      setTicketError(`El ticket "${cleanFolio}" ya ha sido facturado con anterioridad (Comprobante: ${found.billedInvoiceId || 'CFDI emitido'}). Si requieres recuperar tus archivos, contáctanos.`);
      return;
    }

    // Validar monto si fue ingresado
    if (ticketAmount.trim()) {
      const parsedAmount = parseFloat(ticketAmount.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsedAmount) && Math.abs(parsedAmount - found.total) > 1) {
        setTicketError(`El monto ingresado ($${parsedAmount.toFixed(2)}) no coincide con el total del ticket registrado ($${found.total.toFixed(2)}).`);
        return;
      }
    }

    setSelectedTicket(found);
    setStep(2);
  };

  // Selección rápida de ticket de ejemplo
  const handleSelectQuickTicket = (t: CounterTicket) => {
    setTicketFolio(t.folio);
    setTicketAmount(t.total.toString());
    setSelectedTicket(t);
    setTicketError(null);
    setStep(2);
  };

  // Generación de Factura (Paso 2 -> Paso 3)
  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanRfc = rfc.trim().toUpperCase();
    if (!cleanRfc || cleanRfc.length < 12 || cleanRfc.length > 13) {
      setFormError('Ingresa un RFC válido de 12 (Persona Moral) o 13 (Persona Física) caracteres.');
      return;
    }
    if (!razonSocial.trim()) {
      setFormError('Por favor ingresa el Nombre o Razón Social como aparece en tu Cédula Fiscal.');
      return;
    }
    if (!codigoPostal.trim() || codigoPostal.trim().length !== 5) {
      setFormError('Ingresa un Código Postal Fiscal válido de 5 dígitos.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Ingresa un correo electrónico válido para enviarte el XML y PDF.');
      return;
    }

    if (!selectedTicket) return;

    // Calcular desglose de impuestos (IVA 16%)
    const subtotal = Number((selectedTicket.total / 1.16).toFixed(2));
    const iva = Number((selectedTicket.total - subtotal).toFixed(2));

    // Generar UUID fiscal simulado de 36 caracteres
    const hex = (len: number) =>
      Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(len, '0')
        .toUpperCase()
        .slice(0, len);
    const mockUuid = `${hex(8)}-${hex(4)}-4${hex(3)}-9${hex(3)}-${hex(12)}`;
    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: BilledInvoice = {
      id: invoiceId,
      uuid: mockUuid,
      ticketFolio: selectedTicket.folio,
      saleDate: selectedTicket.date,
      stampedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      rfc: cleanRfc,
      razonSocial: razonSocial.trim().toUpperCase(),
      regimenFiscal,
      usoCfdi,
      codigoPostal: codigoPostal.trim(),
      email: email.trim(),
      subtotal,
      iva,
      total: selectedTicket.total,
      paymentMethod:
        selectedTicket.paymentMethod === 'EFECTIVO'
          ? '01 - Efectivo'
          : selectedTicket.paymentMethod === 'TARJETA'
          ? '04 - Tarjeta de crédito/débito'
          : '03 - Transferencia electrónica',
      status: 'VIGENTE',
      items: selectedTicket.items.map((it) => {
        const itemSubtotal = Number((it.subtotal / 1.16).toFixed(2));
        return {
          description: it.name,
          claveSat: it.claveSat || '47131800',
          claveUnidad: 'H87',
          quantity: it.quantity,
          unitPrice: Number((itemSubtotal / it.quantity).toFixed(2)),
          subtotal: itemSubtotal,
        };
      }),
    };

    saveBilledInvoice(newInvoice);
    setGeneratedInvoice(newInvoice);
    setStep(3);
  };

  // Descarga directa de archivo XML CFDI 4.0
  const handleDownloadXml = () => {
    if (!generatedInvoice) return;
    const xmlContent = generateSatXmlString(generatedInvoice);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedInvoice.rfc}_${generatedInvoice.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Imprimir / Guardar como PDF
  const handlePrintPdf = () => {
    window.print();
  };

  const handleSendEmail = () => {
    setIsEmailSent(true);
    setTimeout(() => setIsEmailSent(false), 4000);
  };

  const resetForm = () => {
    setStep(1);
    setTicketFolio('');
    setTicketAmount('');
    setSelectedTicket(null);
    setGeneratedInvoice(null);
    setTicketError(null);
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ======================================================== */}
      {/* 1. HEADER PÚBLICO: PORTAL FACTURACIÓN                    */}
      {/* ======================================================== */}
      <header className="bg-[#580f36] text-white py-3.5 px-4 sm:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="LavaClean Pro Logo" className="w-10 h-10 rounded-xl shadow-md object-contain" />
            <div>
              <span className="block text-xl font-black tracking-tight text-white leading-tight">
                LAVA<span className="text-pink-200">CLEAN</span> PRO
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-pink-200 font-bold leading-none">
                Portal de Auto-Facturación en Línea (CFDI 4.0)
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-bold text-pink-100 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. BARRA DE ESTADO / MODO SANDBOX PREPARADO              */}
      {/* ======================================================== */}
      <div className="bg-amber-500/10 border-b border-amber-300 text-amber-900 py-2.5 px-4 text-xs font-medium">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Ambiente de Demostración & Pruebas CFDI 4.0:</strong> Este módulo emite facturas con estructura oficial SAT lista para enlazar con certificados de sello digital y PAC autorizado.
            </span>
          </div>
          <span className="text-[11px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
            SAT 4.0 Sandbox Activo
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONTENEDOR PRINCIPAL: WIZARD DE 3 PASOS               */}
      {/* ======================================================== */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Barra de Progreso de Pasos */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

            {/* Paso 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                  step >= 1 ? 'bg-[#580f36] text-white shadow-md' : 'bg-slate-200 text-slate-500'
                }`}
              >
                1
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Buscar Ticket</span>
            </div>

            {/* Paso 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                  step >= 2 ? 'bg-[#580f36] text-white shadow-md' : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Datos Fiscales</span>
            </div>

            {/* Paso 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                  step >= 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                }`}
              >
                3
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">Factura & Descargas</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PASO 1: BUSCAR TICKET DE VENTA                           */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Search className="w-5 h-5 text-[#580f36]" />
                Paso 1: Localiza tu Ticket de Compra
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa el folio de tu ticket expedido en mostrador o tienda en línea para emitir tu Comprobante Fiscal Digital.
              </p>
            </div>

            {ticketError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{ticketError}</span>
              </div>
            )}

            <form onSubmit={handleSearchTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Ticket / Folio de Venta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. TICK-2026-0042"
                    value={ticketFolio}
                    onChange={(e) => setTicketFolio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Viene impreso al inicio o pie de tu ticket.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total de la Compra ($ MXN)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1845.00"
                    value={ticketAmount}
                    onChange={(e) => setTicketAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Opcional, para confirmación del importe exacto.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Validar Ticket y Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Accesos rápidos de tickets pendientes de prueba */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tickets recientes disponibles para pruebas rápidas:
                </span>
                <span className="text-[11px] text-slate-400">Clic para autocompletar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tickets
                  .filter((t) => !t.isBilled)
                  .map((t) => (
                    <button
                      key={t.folio}
                      type="button"
                      onClick={() => handleSelectQuickTicket(t)}
                      className="text-left p-3 rounded-xl border border-slate-200 hover:border-[#580f36] hover:bg-pink-50/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#580f36]">{t.folio}</span>
                        <span className="text-xs font-black text-slate-900">${t.total.toFixed(2)} MXN</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 truncate">
                        {t.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {t.branchName} • {t.date}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 2: CAPTURA DE DATOS FISCALES (CFDI 4.0)             */}
        {/* ======================================================== */}
        {step === 2 && selectedTicket && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#580f36]" />
                  Paso 2: Datos Fiscales del Receptor (CFDI 4.0)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Facturando Ticket <strong>{selectedTicket.folio}</strong> por un total de{' '}
                  <strong className="text-slate-900">${selectedTicket.total.toFixed(2)} MXN</strong>.
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cambiar ticket</span>
              </button>
            </div>

            {/* Resumen del ticket a facturar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                Conceptos a Facturar:
              </span>
              <div className="space-y-1.5">
                {selectedTicket.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-700">
                      <strong>{it.quantity}x</strong> {it.name}
                    </span>
                    <span className="font-bold text-slate-900">${it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-slate-200 font-black text-sm">
                <span className="text-slate-800">Total a Facturar:</span>
                <span className="text-[#580f36] text-base">${selectedTicket.total.toFixed(2)} MXN</span>
              </div>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleGenerateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* RFC */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RFC (Registro Federal de Contribuyentes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. TME960709AB1 o RFC de persona física"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    maxLength={13}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    12 caracteres (empresa) o 13 caracteres (persona).
                  </span>
                </div>

                {/* Código Postal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Código Postal Fiscal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 06700"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Debe coincidir con tu Constancia de Situación Fiscal.
                  </span>
                </div>
              </div>

              {/* Nombre o Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre o Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. TINTORERIA Y PLANCHADURIA EXPRESS (sin S.A. de C.V.)"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  En CFDI 4.0 se captura en MAYÚSCULAS y sin el régimen societario (ej. omite S.A. de C.V., S. de R.L.).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Régimen Fiscal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Régimen Fiscal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regimenFiscal}
                    onChange={(e) => setRegimenFiscal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  >
                    {SAT_REGIMENES.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Uso de CFDI */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uso de CFDI <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={usoCfdi}
                    onChange={(e) => setUsoCfdi(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                  >
                    {SAT_USOS_CFDI.map((uso) => (
                      <option key={uso} value={uso}>
                        {uso}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico de Entrega <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#580f36]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Se enviarán los archivos oficiales XML y PDF inmediatamente.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Regresar
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generar y Timbrar Factura CFDI 4.0</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 3: ÉXITO, PREVISUALIZACIÓN Y DESCARGA               */}
        {/* ======================================================== */}
        {step === 3 && generatedInvoice && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-emerald-950 tracking-tight">
                ¡Factura Generada Exitosamente!
              </h2>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                Tu Comprobante Fiscal Digital por Internet (CFDI versión 4.0) ha sido timbrado con folio fiscal oficial.
              </p>

              {/* Botones de Descarga Destacados */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleDownloadXml}
                  className="px-6 py-3 bg-[#580f36] hover:bg-[#430b29] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar XML Oficial</span>
                </button>

                <button
                  onClick={handlePrintPdf}
                  className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  onClick={handleSendEmail}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isEmailSent ? '¡Enviado a tu correo!' : 'Reenviar a mi Correo'}</span>
                </button>
              </div>
            </div>

            {/* Representación Gráfica del Comprobante Fiscal */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6 print:m-0 print:border-none print:shadow-none">
              {/* Encabezado Fiscal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="LavaClean Pro Logo" className="w-12 h-12 rounded-xl object-contain" />
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">LAVACLEAN PRO SA DE CV</h3>
                    <p className="text-[11px] text-slate-500 font-semibold">RFC: LCP240101XYZ • Régimen: 601 General de Ley</p>
                    <p className="text-[11px] text-slate-500">Matriz: Av. Central 450, Centro, CP 06700, CDMX</p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Factura No:</span>
                  <span className="text-lg font-black text-[#580f36] block">{generatedInvoice.id}</span>
                  <span className="text-[10px] text-slate-500 block">Fecha: {generatedInvoice.stampedAt}</span>
                </div>
              </div>

              {/* Datos del Receptor y Folio Fiscal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Receptor (Cliente):
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{generatedInvoice.razonSocial}</p>
                  <p className="text-slate-700">RFC: <strong>{generatedInvoice.rfc}</strong></p>
                  <p className="text-slate-600">Código Postal: {generatedInvoice.codigoPostal}</p>
                  <p className="text-slate-600">Régimen: {generatedInvoice.regimenFiscal}</p>
                  <p className="text-slate-600">Uso CFDI: {generatedInvoice.usoCfdi}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Datos del Comprobante:
                  </span>
                  <p className="text-slate-700">Folio Fiscal (UUID):</p>
                  <p className="font-mono font-bold text-slate-900 break-all text-[11px] bg-white p-1 rounded border border-slate-200">
                    {generatedInvoice.uuid}
                  </p>
                  <p className="text-slate-600">Método de Pago: PUE - Pago en una sola exhibición</p>
                  <p className="text-slate-600">Forma de Pago: {generatedInvoice.paymentMethod}</p>
                  <p className="text-slate-600">Ticket Origen: {generatedInvoice.ticketFolio}</p>
                </div>
              </div>

              {/* Tabla de Conceptos */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#580f36] text-white uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-2 px-3 rounded-l-lg">Clave SAT</th>
                      <th className="py-2 px-3">Cant</th>
                      <th className="py-2 px-3">Descripción</th>
                      <th className="py-2 px-3 text-right">P. Unitario</th>
                      <th className="py-2 px-3 text-right rounded-r-lg">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedInvoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{it.claveSat}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{it.quantity}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{it.description}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">${it.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">${it.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Desglose de Totales */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-800">${generatedInvoice.subtotal.toFixed(2)} MXN</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA Trasladado (16%):</span>
                    <span className="font-bold text-slate-800">${generatedInvoice.iva.toFixed(2)} MXN</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-[#580f36]">
                    <span>Total Comprobante:</span>
                    <span className="text-base">${generatedInvoice.total.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>

              {/* Pie con Sello Digital y Código QR Fiscal */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-[10px] text-slate-500">
                <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0">
                  <QrCode className="w-20 h-20 text-slate-800" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-slate-700">Cadena Original del Complemento de Certificación del SAT:</p>
                  <p className="font-mono text-[9px] break-all leading-tight text-slate-400">
                    ||1.1|{generatedInvoice.uuid}|{generatedInvoice.stampedAt}|SAT970701NN3|{generatedInvoice.rfc}|{generatedInvoice.total.toFixed(2)}||
                  </p>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Este documento es una representación impresa de un CFDI versión 4.0.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón para facturar otro ticket */}
            <div className="text-center pt-2">
              <button
                onClick={resetForm}
                className="text-xs font-bold text-[#580f36] hover:underline cursor-pointer"
              >
                ¿Deseas facturar otro ticket de compra? Clic aquí
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 px-4 text-center mt-auto border-t border-slate-800">
        <p className="font-medium">
          LavaClean Pro — Sistema ERP & Facturación Fiscal SAT 4.0 para Lavanderías y Tintorerías.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Dudas o asistencia con tu factura: ventas@lavacleanpro.com • Tel. 55-5555-0101
        </p>
      </footer>
    </div>
  );
};

