// Gestión de Órdenes de Venta Directa de Mostrador enviadas a Caja de Cobro
export interface CounterOrder {
  id: string;
  folio: string; // ej: ORD-2026-0081
  createdAt: string;
  sellerName: string;
  customerName: string;
  branchName: string;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  iva: number;
  total: number;
  status: 'PENDIENTE_PAGO' | 'PAGADO' | 'CANCELADO';
  paidAt?: string;
  cashierName?: string;
  paymentMethod?: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  amountPaid?: number;
  changeGiven?: number;
  ticketFolio?: string;
}

const STORAGE_KEY_ORDERS = 'lavaclean_counter_orders_v1';

const INITIAL_ORDERS: CounterOrder[] = [
  {
    id: 'ord-1',
    folio: 'ORD-2026-1011',
    createdAt: '2026-11-12 10:15',
    sellerName: 'Roberto Gómez (Mostrador A)',
    customerName: 'Tintorería Express El Rosario',
    branchName: 'Sucursal Matriz Centro',
    items: [
      {
        id: 'p1',
        sku: 'LAV-DET-01',
        name: 'Detergente Enzimático Concentrado 20L (Biodegradable)',
        quantity: 2,
        price: 680.0,
        subtotal: 1360.0,
      },
      {
        id: 'p4',
        sku: 'EMP-GAN-04',
        name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
        quantity: 1,
        price: 485.0,
        subtotal: 485.0,
      },
    ],
    subtotal: 1590.52,
    iva: 254.48,
    total: 1845.0,
    status: 'PENDIENTE_PAGO',
  },
  {
    id: 'ord-2',
    folio: 'ORD-2026-1012',
    createdAt: '2026-11-12 10:30',
    sellerName: 'Roberto Gómez (Mostrador A)',
    customerName: 'Público en General',
    branchName: 'Sucursal Matriz Centro',
    items: [
      {
        id: 'p7',
        sku: 'EQ-PLANC-07',
        name: 'Zapata de Teflón Antibrillo para Plancha Industrial de Vapor',
        quantity: 2,
        price: 320.0,
        subtotal: 640.0,
      },
      {
        id: 'p6',
        sku: 'DESM-GRAS-06',
        name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
        quantity: 1,
        price: 420.0,
        subtotal: 420.0,
      },
    ],
    subtotal: 913.79,
    iva: 146.21,
    total: 1060.0,
    status: 'PENDIENTE_PAGO',
  },
  {
    id: 'ord-0',
    folio: 'ORD-2026-1008',
    createdAt: '2026-11-12 09:10',
    sellerName: 'Roberto Gómez (Mostrador A)',
    customerName: 'Lavandería Clean & Go',
    branchName: 'Sucursal Matriz Centro',
    items: [
      {
        id: 'p2',
        sku: 'LAV-SUAV-02',
        name: 'Suavizante Textil Concentrado Aroma Lavanda Francesa 20L',
        quantity: 2,
        price: 540.0,
        subtotal: 1080.0,
      },
    ],
    subtotal: 931.03,
    iva: 148.97,
    total: 1080.0,
    status: 'PAGADO',
    paidAt: '2026-11-12 09:18',
    cashierName: 'Carlos López (Caja 1)',
    paymentMethod: 'TARJETA',
    ticketFolio: 'TICK-2026-0041',
  },
];

export function getStoredCounterOrders(): CounterOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredCounterOrder(order: CounterOrder): void {
  const current = getStoredCounterOrders();
  const updated = [order, ...current];
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  window.dispatchEvent(new Event('counter_orders_updated'));
}

export function markOrderAsPaid(
  orderId: string,
  paymentInfo: {
    cashierName: string;
    paymentMethod: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
    amountPaid: number;
    changeGiven: number;
    ticketFolio: string;
  }
): CounterOrder | null {
  const current = getStoredCounterOrders();
  const idx = current.findIndex((o) => o.id === orderId || o.folio.toLowerCase() === orderId.toLowerCase());
  if (idx < 0) return null;

  current[idx] = {
    ...current[idx],
    status: 'PAGADO',
    paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    cashierName: paymentInfo.cashierName,
    paymentMethod: paymentInfo.paymentMethod,
    amountPaid: paymentInfo.amountPaid,
    changeGiven: paymentInfo.changeGiven,
    ticketFolio: paymentInfo.ticketFolio,
  };

  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(current));
  window.dispatchEvent(new Event('counter_orders_updated'));
  return current[idx];
}

export function cancelCounterOrder(orderId: string): void {
  const current = getStoredCounterOrders();
  const idx = current.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    current[idx].status = 'CANCELADO';
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(current));
    window.dispatchEvent(new Event('counter_orders_updated'));
  }
}

