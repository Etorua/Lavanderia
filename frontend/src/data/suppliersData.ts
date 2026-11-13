export interface Supplier {
  id: string;
  rfc: string;
  business_name: string; // Razón Social
  commercial_name: string; // Nombre Comercial
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  tax_regime: string; // Régimen fiscal (ej. 601 General de Ley PM)
  currency: 'MXN' | 'USD';
  credit_days: number;
  category: string;
  is_active: boolean;
  created_at: string;
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    rfc: 'QID080415ML2',
    business_name: 'Química Industrial & Detergentes de México S.A. de C.V.',
    commercial_name: 'Química Industrial MX',
    contact_name: 'Ing. Roberto Santillán',
    email: 'ventas@quimicaindustrial.com.mx',
    phone: '55-8888-0000',
    address: 'Av. Industrial Químico #450, Parque Industrial Lerma',
    city: 'Toluca',
    state: 'Estado de México',
    postal_code: '52000',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    credit_days: 30,
    category: 'Detergentes & Químicos',
    is_active: true,
    created_at: '2026-01-15',
  },
  {
    id: 'sup-2',
    rfc: 'MGN120618AB4',
    business_name: 'Metalmecánica & Ganchos del Norte S.A. de C.V.',
    commercial_name: 'Ganchos del Norte',
    contact_name: 'Lic. Claudia Villarreal',
    email: 'pedidos@ganchosdelnorte.com',
    phone: '81-8300-1122',
    address: 'Blvd. Diaz Ordaz #1200, Col. Santa María',
    city: 'Monterrey',
    state: 'Nuevo León',
    postal_code: '64650',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    credit_days: 15,
    category: 'Empaque & Ganchos',
    is_active: true,
    created_at: '2026-02-10',
  },
  {
    id: 'sup-3',
    rfc: 'SQP051120KP9',
    business_name: 'Solventes & Químicos de Alta Pureza de Monterrey S.A. de C.V.',
    commercial_name: 'Solventes Monterrey Clean',
    contact_name: 'Quím. Gerardo Garza',
    email: 'atencion@solventesmonterrey.com',
    phone: '81-1244-9988',
    address: 'Carretera a Colombia Km 8.5',
    city: 'San Nicolás de los Garza',
    state: 'Nuevo León',
    postal_code: '66450',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'USD',
    credit_days: 45,
    category: 'Desmanchadores & Solventes Secos',
    is_active: true,
    created_at: '2026-02-28',
  },
  {
    id: 'sup-4',
    rfc: 'PEI150312TX8',
    business_name: 'Polietilenos & Empaques Industriales del Bajío S.A. de C.V.',
    commercial_name: 'Empaques Bajío',
    contact_name: 'Ing. Marco Antonio Ruiz',
    email: 'ventas@empaquesbajio.com',
    phone: '477-771-4500',
    address: 'Circuito de la Industria #89, Fracc. Delta',
    city: 'León',
    state: 'Guanajuato',
    postal_code: '37545',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    credit_days: 30,
    category: 'Empaque & Ganchos',
    is_active: true,
    created_at: '2026-03-05',
  },
  {
    id: 'sup-5',
    rfc: 'ECV990925RZ1',
    business_name: 'Equipos & Calderas de Vapor de Occidente S.A. de C.V.',
    commercial_name: 'Calderas Occidente',
    contact_name: 'Ing. Alejandro Fonseca',
    email: 'soporte@calderasoccidente.com.mx',
    phone: '33-3619-2020',
    address: 'Calzada González Gallo #1850',
    city: 'Guadalajara',
    state: 'Jalisco',
    postal_code: '44890',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'USD',
    credit_days: 60,
    category: 'Refacciones & Planchado',
    is_active: true,
    created_at: '2026-03-20',
  },
];

// Clientes y Empresas con RFC para autocompletar en Cotizaciones
export interface TaxEntity {
  rfc: string;
  business_name: string;
  commercial_name?: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  tax_regime: string;
  currency: 'MXN' | 'USD';
  type: 'CLIENTE' | 'PROVEEDOR';
}

export const INITIAL_TAX_ENTITIES: TaxEntity[] = [
  // Clientes Frecuentes
  {
    rfc: 'LSE190822HJ3',
    business_name: 'Lavandería & Tintorería El Sol Express S.A. de C.V.',
    commercial_name: 'Tintorería El Sol Express',
    contact_name: 'Lic. Roberto Méndez',
    email: 'compras@elsolclean.com.mx',
    phone: '55-8888-9999',
    address: 'Av. Insurgentes Sur #1450, Col. Del Valle, Benito Juárez, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    type: 'CLIENTE',
  },
  {
    rfc: 'HSA140210KL5',
    business_name: 'Operadora Hotelera & Suites Alameda S.A. de C.V.',
    commercial_name: 'Hotel Alameda (Ropería)',
    contact_name: 'Ing. Carlos Valdés (Jefe de Lavandería)',
    email: 'roperia@hotelalameda.com.mx',
    phone: '55-1111-2222',
    address: 'Av. Juárez #52, Centro Histórico, Cuauhtémoc, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    type: 'CLIENTE',
  },
  {
    rfc: 'TFA180517NM2',
    business_name: 'Tintorería Francesa de Alta Costura S.C.',
    commercial_name: 'Tintorería Francesa',
    contact_name: 'Mtra. Gabriela Soto',
    email: 'contacto@tintoreriafrancesa.mx',
    phone: '55-4444-7777',
    address: 'Campos Elíseos #204, Polanco V Sección, Miguel Hidalgo, CDMX',
    tax_regime: '612 - Personas Físicas con Actividades Empresariales',
    currency: 'MXN',
    type: 'CLIENTE',
  },
  {
    rfc: 'LAV210304Q91',
    business_name: 'Servicios Textiles & Planchaduría Express del Centro S.A.',
    commercial_name: 'Planchaduría Express Centro',
    contact_name: 'C.P. Fernando Morales',
    email: 'adquisiciones@planchaduriaexpress.mx',
    phone: '55-3344-5566',
    address: 'Eje Central Lázaro Cárdenas #310, Cuauhtémoc, CDMX',
    tax_regime: '601 - General de Ley Personas Morales',
    currency: 'MXN',
    type: 'CLIENTE',
  },
  // Proveedores registrados
  ...INITIAL_SUPPLIERS.map((s) => ({
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

const LOCAL_STORAGE_KEY_SUPPLIERS = 'lavaclean_suppliers_data';

export const getStoredSuppliers = (): Supplier[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SUPPLIERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error leyendo proveedores de localStorage', err);
  }
  return INITIAL_SUPPLIERS;
};

export const saveStoredSuppliers = (suppliers: Supplier[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SUPPLIERS, JSON.stringify(suppliers));
  } catch (err) {
    console.error('Error guardando proveedores en localStorage', err);
  }
};

