export type UserRole =
  | 'SUPERADMIN'
  | 'CLIENTE_ADMIN'
  | 'CONTABILIDAD_CORP'
  | 'COMPRADOR_CORP'
  | 'ALMACENISTA_CENTRAL'
  | 'ADMIN_SUCURSAL'
  | 'FINANZAS_SUCURSAL'
  | 'CAJERO'
  | 'VENDEDOR'
  | 'ALMACENISTA_SUCURSAL'
  | 'MARKETING'
  | 'CLIENTE_FINAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  business_id?: string | null;
  branch_id?: string | null;
  is_locked: boolean;
  lock_reason?: string | null;
  branch?: {
    id: string;
    name: string;
    code: string;
    is_locked: boolean;
    lock_reason?: string | null;
    min_consumption?: number;
    current_month_sales?: number;
  } | null;
  business?: {
    id: string;
    name: string;
    is_locked: boolean;
    lock_reason?: string | null;
  } | null;
}

export interface Product {
  id: string;
  sku: string;
  qr_code: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reserved_stock: number;
  in_transit_stock: number;
  safety_stock: number;
  min_stock: number;
  max_stock: number;
  lead_time_days: number;
  image_url?: string | null;
  is_active: boolean;
  last_sale_at?: string | null;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  discount_tag?: string;
  image_url: string;
  category_target?: string;
  position: 'HERO_SLIDER' | 'MOSAIC_PROMO' | 'FLASH_OFFER' | 'STRIP_BANNER';
  background_color?: string;
  link_url?: string;
  is_active: boolean;
  order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  folio: string;
  client_name: string;
  client_rfc?: string | null;
  client_contact?: string | null;
  client_email?: string | null;
  client_address?: string | null;
  tax_regime?: string | null;
  currency?: 'MXN' | 'USD';
  total: number;
  status: 'PENDIENTE' | 'RESERVADA' | 'CONVERTIDA' | 'EXPIRADA' | 'CANCELADA';
  reserves_stock: boolean;
  reservation_expires_at?: string | null;
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    tax_type?: 'IVA_16' | 'EXENTO' | 'IVA_INCLUIDO';
    tax_amount?: number;
    currency?: 'MXN' | 'USD';
    product: Product;
  }>;
}

export interface CashCut {
  id: string;
  branch_id: string;
  user_id: string;
  initial_cash: number;
  cash_sales: number;
  card_sales: number;
  transfer_sales: number;
  mixed_sales: number;
  total_sales: number;
  expected_cash: number;
  actual_cash_counted?: number | null;
  difference?: number | null;
  notes?: string | null;
  status: 'ABIERTO' | 'CERRADO' | 'AUDITADO_LOCAL' | 'AUDITADO_CORP';
  opened_at: string;
  closed_at?: string | null;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  is_locked: boolean;
  lock_reason?: string | null;
  min_consumption: number;
  current_month_sales: number;
  porcentaje_meta?: string;
  alerta_candado?: string;
}

export interface StandbyTicket {
  id: string;
  reference_name: string;
  cart_data: CartItem[];
  created_at: string;
  user?: {
    full_name: string;
  };
}
