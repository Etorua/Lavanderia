import { Quotation, Product } from '../types';

export const INVENTORY_CATALOG: Product[] = [
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

export const INITIAL_QUOTATIONS: Quotation[] = [
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
    reservation_expires_at: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
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
    reservation_expires_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
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
  {
    id: 'q-4',
    folio: 'COT-2026-0039',
    client_rfc: 'LCO191105TY8',
    client_name: 'Lavandería Comercial Las Palmas S.A. de C.V.',
    client_contact: 'Don Ramón Ortega (55-7766-5544)',
    client_email: 'ramon@laspalmaslav.com',
    client_address: 'Calzada de Tlalpan #2400, Coyoacán, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    total: 5626.0,
    status: 'PENDIENTE',
    reserves_stock: false,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    items: [
      {
        id: 'qi-4',
        product_id: 'p2',
        quantity: 6,
        unit_price: 520.0,
        tax_type: 'IVA_16',
        tax_amount: 499.2,
        currency: 'MXN',
        subtotal: 3120.0,
        product: INVENTORY_CATALOG[1],
      },
      {
        id: 'qi-5',
        product_id: 'p4',
        quantity: 3,
        unit_price: 485.0,
        tax_type: 'IVA_16',
        tax_amount: 232.8,
        currency: 'MXN',
        subtotal: 1455.0,
        product: INVENTORY_CATALOG[3],
      },
    ],
  },
];

const LOCAL_STORAGE_KEY_QUOTATIONS = 'lavaclean_quotations_data';

export const getStoredQuotations = (): Quotation[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTATIONS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error leyendo cotizaciones de localStorage', err);
  }
  return INITIAL_QUOTATIONS;
};

export const saveStoredQuotations = (quotations: Quotation[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_QUOTATIONS, JSON.stringify(quotations));
    window.dispatchEvent(new Event('quotations_updated'));
  } catch (err) {
    console.error('Error guardando cotizaciones en localStorage', err);
  }
};

/**
 * Pasa una cotización al Módulo de Reservas, activando el candado de stock por 48 horas
 */
export const promoteToReservation = (id: string): { success: boolean; message: string; quotation?: Quotation } => {
  const list = getStoredQuotations();
  const q = list.find((item) => item.id === id);
  if (!q) {
    return { success: false, message: 'Cotización no encontrada.' };
  }

  q.reserves_stock = true;
  q.status = 'RESERVADA';
  q.reservation_expires_at = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

  saveStoredQuotations(list);
  return {
    success: true,
    message: `✅ Cotización ${q.folio} promovida con éxito al Módulo de Reservas (Candado 48h activado).`,
    quotation: q,
  };
};

/**
 * Libera el stock reservado regresándolo a cotización ordinaria o cancelada
 */
export const releaseReservation = (id: string): { success: boolean; message: string } => {
  const list = getStoredQuotations();
  const q = list.find((item) => item.id === id);
  if (!q) {
    return { success: false, message: 'Reserva no encontrada.' };
  }

  q.reserves_stock = false;
  q.status = 'PENDIENTE';
  q.reservation_expires_at = null;

  saveStoredQuotations(list);
  return {
    success: true,
    message: `🔓 Mercancía de ${q.folio} liberada. El stock físico ha regresado a disponible en almacén.`,
  };
};

/**
 * Extiende la reserva activa por 24 horas adicionales
 */
export const extendReservation = (id: string, hours = 24): { success: boolean; message: string } => {
  const list = getStoredQuotations();
  const q = list.find((item) => item.id === id);
  if (!q) {
    return { success: false, message: 'Reserva no encontrada.' };
  }

  const currentExpire = q.reservation_expires_at ? new Date(q.reservation_expires_at).getTime() : Date.now();
  const baseTime = Math.max(Date.now(), currentExpire);
  q.reservation_expires_at = new Date(baseTime + hours * 3600 * 1000).toISOString();
  q.reserves_stock = true;
  q.status = 'RESERVADA';

  saveStoredQuotations(list);
  return {
    success: true,
    message: `⏱ Reserva ${q.folio} extendida +${hours}h con éxito.`,
  };
};

/**
 * Marca la reserva como convertida tras ser cobrada en POS
 */
export const convertReservationToSale = (id: string): void => {
  const list = getStoredQuotations();
  const updated = list.map((q) => (q.id === id ? { ...q, status: 'CONVERTIDA' as const } : q));
  saveStoredQuotations(updated);
};

