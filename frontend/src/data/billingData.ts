// Almacén y utilidades para Facturación en Línea y Tickets de Venta de Mostrador
export interface BilledInvoice {
  id: string;
  uuid: string; // Folio fiscal del SAT
  ticketFolio: string;
  saleDate: string;
  stampedAt: string;
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
  usoCfdi: string;
  codigoPostal: string;
  email: string;
  subtotal: number;
  iva: number;
  total: number;
  paymentMethod: string;
  status: 'VIGENTE' | 'CANCELADA';
  items: Array<{
    description: string;
    claveSat: string;
    claveUnidad: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export interface CounterTicket {
  folio: string;
  date: string;
  branchName: string;
  cashierName: string;
  customerName: string;
  paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    claveSat?: string;
  }>;
  subtotal: number;
  iva: number;
  total: number;
  amountPaid: number;
  changeGiven: number;
  isBilled: boolean;
  billedInvoiceId?: string;
}

const STORAGE_KEY_TICKETS = 'lavaclean_counter_tickets_v1';
const STORAGE_KEY_INVOICES = 'lavaclean_invoices_v1';

// Tickets semilla de ejemplo para que el usuario pueda probar el buscador inmediatamente
const INITIAL_TICKETS: CounterTicket[] = [
  {
    folio: 'TICK-2026-0042',
    date: '2026-11-12 09:30',
    branchName: 'Sucursal Matriz Centro',
    cashierName: 'Carlos López (Caja 1)',
    customerName: 'Tintorería Express El Rosario',
    paymentMethod: 'EFECTIVO',
    items: [
      {
        id: 'p1',
        name: 'Detergente Enzimático Concentrado 20L (Biodegradable)',
        quantity: 2,
        price: 680.0,
        subtotal: 1360.0,
        claveSat: '47131811',
      },
      {
        id: 'p4',
        name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
        quantity: 1,
        price: 485.0,
        subtotal: 485.0,
        claveSat: '44122000',
      },
    ],
    subtotal: 1590.52,
    iva: 254.48,
    total: 1845.0,
    amountPaid: 2000.0,
    changeGiven: 155.0,
    isBilled: false,
  },
  {
    folio: 'TICK-2026-0043',
    date: '2026-11-12 10:15',
    branchName: 'Sucursal Matriz Centro',
    cashierName: 'Carlos López (Caja 1)',
    customerName: 'Público en General',
    paymentMethod: 'TARJETA',
    items: [
      {
        id: 'p3',
        name: 'Solvente para Limpieza en Seco Percloroetileno Grado Puro 25L',
        quantity: 1,
        price: 1450.0,
        subtotal: 1450.0,
        claveSat: '12142100',
      },
      {
        id: 'p6',
        name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
        quantity: 1,
        price: 420.0,
        subtotal: 420.0,
        claveSat: '47131800',
      },
    ],
    subtotal: 1612.07,
    iva: 257.93,
    total: 1870.0,
    amountPaid: 1870.0,
    changeGiven: 0.0,
    isBilled: false,
  },
  {
    folio: 'TICK-2026-0039',
    date: '2026-11-11 16:40',
    branchName: 'Sucursal Matriz Centro',
    cashierName: 'María Santos (Caja 2)',
    customerName: 'Lavandería Automática Burbujas',
    paymentMethod: 'TRANSFERENCIA',
    items: [
      {
        id: 'p5',
        name: 'Rollo Polietileno Tubular Transparente Cubre Ropa 1000m',
        quantity: 1,
        price: 890.0,
        subtotal: 890.0,
        claveSat: '24102100',
      },
    ],
    subtotal: 767.24,
    iva: 122.76,
    total: 890.0,
    amountPaid: 890.0,
    changeGiven: 0.0,
    isBilled: true,
    billedInvoiceId: 'INV-2026-0018',
  },
];

const INITIAL_INVOICES: BilledInvoice[] = [
  {
    id: 'INV-2026-0018',
    uuid: '7A81BC90-12A4-4A8E-95B2-DF89104AC39B',
    ticketFolio: 'TICK-2026-0039',
    saleDate: '2026-11-11 16:40',
    stampedAt: '2026-11-11 17:05:12',
    rfc: 'LABU901215AB1',
    razonSocial: 'LAVANDERIA AUTOMATICA BURBUJAS',
    regimenFiscal: '612 - Personas Físicas con Actividades Empresariales y Profesionales',
    usoCfdi: 'G03 - Gastos en general',
    codigoPostal: '06700',
    email: 'contacto@lavanderiaburbujas.com',
    subtotal: 767.24,
    iva: 122.76,
    total: 890.0,
    paymentMethod: '03 - Transferencia electrónica de fondos',
    status: 'VIGENTE',
    items: [
      {
        description: 'Rollo Polietileno Tubular Transparente Cubre Ropa 1000m',
        claveSat: '24102100',
        claveUnidad: 'H87',
        quantity: 1,
        unitPrice: 767.24,
        subtotal: 767.24,
      },
    ],
  },
];

export function getStoredTickets(): CounterTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TICKETS;
  }
}

export function saveCounterTicket(ticket: CounterTicket): void {
  const current = getStoredTickets();
  const updated = [ticket, ...current];
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
}

export function getStoredInvoices(): BilledInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVOICES;
  }
}

export function saveBilledInvoice(invoice: BilledInvoice): void {
  const current = getStoredInvoices();
  const updated = [invoice, ...current];
  localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(updated));

  // Marcar ticket como facturado
  const tickets = getStoredTickets();
  const tIdx = tickets.findIndex((t) => t.folio.toLowerCase() === invoice.ticketFolio.toLowerCase());
  if (tIdx >= 0) {
    tickets[tIdx].isBilled = true;
    tickets[tIdx].billedInvoiceId = invoice.id;
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }
}

export function generateSatXmlString(invoice: BilledInvoice): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="4.0" Serie="F" Folio="${invoice.id.replace('INV-', '')}" Fecha="${invoice.stampedAt}" FormaPago="01" SubTotal="${invoice.subtotal.toFixed(2)}" Moneda="MXN" Total="${invoice.total.toFixed(2)}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="${invoice.codigoPostal}" Sello="MOCK_SELLO_DIGITAL_EMISOR_${Date.now()}">
  <cfdi:Emisor Rfc="LCP240101XYZ" Nombre="LAVACLEAN PRO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${invoice.rfc}" Nombre="${invoice.razonSocial}" DomicilioFiscalReceptor="${invoice.codigoPostal}" RegimenFiscalReceptor="${invoice.regimenFiscal.split(' - ')[0]}" UsoCFDI="${invoice.usoCfdi.split(' - ')[0]}"/>
  <cfdi:Conceptos>
${invoice.items
  .map(
    (item) => `    <cfdi:Concepto ClaveProdServ="${item.claveSat}" Cantidad="${item.quantity}" ClaveUnidad="${item.claveUnidad}" Descripcion="${item.description}" ValorUnitario="${item.unitPrice.toFixed(2)}" Importe="${item.subtotal.toFixed(2)}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${item.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${(item.subtotal * 0.16).toFixed(2)}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`
  )
  .join('\n')}
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${invoice.iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${invoice.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${invoice.iva.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="${invoice.uuid}" FechaTimbrado="${invoice.stampedAt}" RfcProvCertif="SAT970701NN3" SelloCFD="MOCK_SELLO_CFDI" NoCertificadoSAT="00001000000504465028" SelloSAT="MOCK_SELLO_SAT"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
}

