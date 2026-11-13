import { UserRole } from '../types';

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  type: 'CEDIS' | 'SUCURSAL';
  address: string;
  manager: string;
}

export const WAREHOUSES: WarehouseLocation[] = [
  {
    id: 'wh-cedis',
    code: 'CEDIS-TOL',
    name: 'Almacén Central CEDIS (Toluca)',
    type: 'CEDIS',
    address: 'Parque Industrial Toluca 2000, Bodega C-12, Edo. Méx.',
    manager: 'Ing. Fernando (Jefe de CEDIS Central)',
  },
  {
    id: 'wh-centro',
    code: 'SUC-CENTRO',
    name: 'Sucursal Centro',
    type: 'SUCURSAL',
    address: 'Av. Juárez #104, Centro Histórico, CDMX',
    manager: 'Miguel Bodega (Almacén Sucursal Centro)',
  },
  {
    id: 'wh-norte',
    code: 'SUC-NORTE',
    name: 'Sucursal Norte (Módulo Plaza)',
    type: 'SUCURSAL',
    address: 'Plaza Satélite Local 45, Naucalpan, Edo. Méx.',
    manager: 'Raúl Guardado (Almacén Norte)',
  },
  {
    id: 'wh-sur',
    code: 'SUC-SUR',
    name: 'Sucursal Sur Periférico',
    type: 'SUCURSAL',
    address: 'Anillo Periférico Sur #4200, Tlalpan, CDMX',
    manager: 'Esteban Mora (Almacén Sur)',
  },
];

// Comprueba si el rol puede visualizar todos los almacenes o únicamente el asignado
export const canViewAllWarehouses = (role?: UserRole): boolean => {
  if (!role) return false;
  return ['SUPERADMIN', 'CLIENTE_ADMIN', 'ALMACENISTA_CENTRAL', 'COMPRADOR_CORP', 'CONTABILIDAD_CORP'].includes(role);
};

export const getAssignedWarehouseForRole = (role?: UserRole, userBranchName?: string): string => {
  if (role === 'ALMACENISTA_CENTRAL') {
    return 'Almacén Central CEDIS (Toluca)';
  }
  if (role === 'ALMACENISTA_SUCURSAL' || role === 'ADMIN_SUCURSAL' || role === 'CAJERO' || role === 'VENDEDOR') {
    return userBranchName || 'Sucursal Centro';
  }
  return 'TODOS';
};

// Modelo de Recepción / Entrada vinculada a Orden de Compra (PO)
export interface MaterialReception {
  id: string;
  reception_folio: string;
  po_number: string;
  supplier_name: string;
  target_warehouse: string;
  received_at: string;
  receiver_user: string;
  status: 'RECIBIDA_TOTAL' | 'RECIBIDA_PARCIAL' | 'PENDIENTE_INSPECCION' | 'EN_TRANSITO';
  carrier_guide?: string;
  notes?: string;
  items: Array<{
    sku: string;
    product_name: string;
    ordered_qty: number;
    received_qty: number;
    unit: string;
    condition: 'BUEN_ESTADO' | 'DANADO' | 'MERMA_PARCIAL';
  }>;
}

export const INITIAL_RECEPTIONS: MaterialReception[] = [
  {
    id: 'rec-1',
    reception_folio: 'REC-2026-0045',
    po_number: 'PO-2026-0017',
    supplier_name: 'Metalmecánica & Ganchos del Norte S.A.',
    target_warehouse: 'Almacén Central CEDIS (Toluca)',
    received_at: '2026-11-08 10:30',
    receiver_user: 'Ing. Fernando (CEDIS Central)',
    status: 'RECIBIDA_TOTAL',
    carrier_guide: 'GUIA-FEDEX-998822',
    notes: 'Tarimas completas con emplaye de seguridad intacto.',
    items: [
      {
        sku: 'EMP-GAN-04',
        product_name: 'Caja de Ganchos Metálicos Galvanizados Calibre 13 (500 pzas)',
        ordered_qty: 50,
        received_qty: 50,
        unit: 'Cajas',
        condition: 'BUEN_ESTADO',
      },
    ],
  },
  {
    id: 'rec-2',
    reception_folio: 'REC-2026-0046',
    po_number: 'PO-2026-0018',
    supplier_name: 'Química Industrial & Detergentes de México S.A.',
    target_warehouse: 'Almacén Central CEDIS (Toluca)',
    received_at: '2026-11-09 14:15',
    receiver_user: 'Ing. Fernando (CEDIS Central)',
    status: 'RECIBIDA_TOTAL',
    carrier_guide: 'TRANSP-TRES-GUERRAS-4411',
    notes: 'Porrones de 20L recibidos con precinto hermético sellado.',
    items: [
      {
        sku: 'LAV-DET-01',
        product_name: 'Detergente Enzimático Industrial 20L (Biodegradable)',
        ordered_qty: 50,
        received_qty: 50,
        unit: 'Porrones',
        condition: 'BUEN_ESTADO',
      },
    ],
  },
  {
    id: 'rec-3',
    reception_folio: 'REC-2026-0047',
    po_number: 'PO-2026-0019',
    supplier_name: 'Solventes & Químicos de Tintorería Internacional',
    target_warehouse: 'Sucursal Centro',
    received_at: '2026-11-10 09:00',
    receiver_user: 'Miguel Bodega (Sucursal Centro)',
    status: 'RECIBIDA_PARCIAL',
    carrier_guide: 'DHL-EXPRESS-110099',
    notes: 'Llegaron 15 porrones de solvente; 5 porrones pendientes de segundo flete.',
    items: [
      {
        sku: 'TINT-SOLV-03',
        product_name: 'Solvente Limpieza en Seco Percloroetileno Grado Puro 25L',
        ordered_qty: 20,
        received_qty: 15,
        unit: 'Porrones',
        condition: 'BUEN_ESTADO',
      },
      {
        sku: 'DESM-GRAS-06',
        product_name: 'Quitamanchas Profesional para Grasa, Cuellos & Maquillaje 5L',
        ordered_qty: 15,
        received_qty: 15,
        unit: 'Garrafas',
        condition: 'BUEN_ESTADO',
      },
    ],
  },
];

// Modelo de Traspaso entre Almacenes y Salidas por Merma
export interface WarehouseTransfer {
  id: string;
  folio: string;
  transfer_type: 'TRASPASO_SUCURSAL' | 'MERMA_DESECHO' | 'CONSUMO_INTERNO_LAVANDERIA';
  source_warehouse: string;
  target_warehouse?: string; // Solo en traspaso
  requested_by: string;
  authorized_by: string;
  carrier_name?: string;
  date: string;
  status: 'EN_TRANSITO' | 'RECIBIDO_EN_DESTINO' | 'BAJA_APROBADA';
  notes?: string;
  items: Array<{
    sku: string;
    product_name: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
}

export const INITIAL_TRANSFERS: WarehouseTransfer[] = [
  {
    id: 'trasp-1',
    folio: 'TRASP-2026-0012',
    transfer_type: 'TRASPASO_SUCURSAL',
    source_warehouse: 'Almacén Central CEDIS (Toluca)',
    target_warehouse: 'Sucursal Centro',
    requested_by: 'Miguel Bodega (Sucursal Centro)',
    authorized_by: 'Ing. Fernando (CEDIS Central)',
    carrier_name: 'Camioneta Reparto Interno #04 (Chofer: Pedro Martínez)',
    date: '2026-11-09 11:00',
    status: 'RECIBIDO_EN_DESTINO',
    notes: 'Resurtido de stock crítico para mostrador de tintorería.',
    items: [
      {
        sku: 'LAV-DET-01',
        product_name: 'Detergente Enzimático Industrial 20L',
        quantity: 10,
        unit: 'Porrones',
        cost: 420.0,
      },
      {
        sku: 'EMP-GAN-04',
        product_name: 'Caja de Ganchos Metálicos Galvanizados (500 pzas)',
        quantity: 15,
        unit: 'Cajas',
        cost: 290.0,
      },
    ],
  },
  {
    id: 'trasp-2',
    folio: 'TRASP-2026-0013',
    transfer_type: 'TRASPASO_SUCURSAL',
    source_warehouse: 'Almacén Central CEDIS (Toluca)',
    target_warehouse: 'Sucursal Norte (Módulo Plaza)',
    requested_by: 'Raúl Guardado (Sucursal Norte)',
    authorized_by: 'Ing. Fernando (CEDIS Central)',
    carrier_name: 'Camioneta Reparto Interno #02 (Chofer: Jorge Campos)',
    date: '2026-11-10 08:30',
    status: 'EN_TRANSITO',
    notes: 'En ruta de traslado sobre Periférico Norte.',
    items: [
      {
        sku: 'LAV-SUAV-02',
        product_name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
        quantity: 8,
        unit: 'Porrones',
        cost: 310.0,
      },
      {
        sku: 'EMP-POL-05',
        product_name: 'Rollo Polietileno Tubular Transparente para Ropa 1000m',
        quantity: 5,
        unit: 'Rollos',
        cost: 560.0,
      },
    ],
  },
  {
    id: 'trasp-3',
    folio: 'MERMA-2026-0004',
    transfer_type: 'MERMA_DESECHO',
    source_warehouse: 'Sucursal Centro',
    requested_by: 'Miguel Bodega (Sucursal Centro)',
    authorized_by: 'Lic. Marco Antonio (Gerente Centro)',
    date: '2026-11-09 16:40',
    status: 'BAJA_APROBADA',
    notes: 'Porrón perforado en maniobra de descarga en rampa.',
    items: [
      {
        sku: 'LAV-SUAV-02',
        product_name: 'Suavizante Textil Concentrado Aroma Lavanda 20L',
        quantity: 1,
        unit: 'Porrón',
        cost: 310.0,
      },
    ],
  },
];

