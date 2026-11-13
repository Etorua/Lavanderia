import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PROFILES: Record<UserRole, User> = {
  SUPERADMIN: {
    id: 'usr-admin',
    email: 'admin@sistema.com',
    full_name: 'Super Administrador Global',
    role: 'SUPERADMIN',
    is_locked: false,
  },
  CLIENTE_ADMIN: {
    id: 'usr-director',
    email: 'director@alpha.com',
    full_name: 'Roberto Gómez (Director General)',
    role: 'CLIENTE_ADMIN',
    business_id: 'biz-001',
    is_locked: false,
    business: { id: 'biz-001', name: 'LavaClean Pro - Insumos de Lavandería & Tintorería S.A. de C.V.', is_locked: false },
  },
  MARKETING: {
    id: 'usr-marketing',
    email: 'marketing@alpha.com',
    full_name: 'Lic. Mariana Soto (Jefa de Marketing y Banners)',
    role: 'MARKETING',
    business_id: 'biz-001',
    is_locked: false,
  },
  CONTABILIDAD_CORP: {
    id: 'usr-contabilidad',
    email: 'contabilidad.corp@alpha.com',
    full_name: 'Lic. Sofia Morales (Contabilidad Corp)',
    role: 'CONTABILIDAD_CORP',
    business_id: 'biz-001',
    is_locked: false,
  },
  COMPRADOR_CORP: {
    id: 'usr-comprador',
    email: 'comprador@alpha.com',
    full_name: 'Laura Compras (Procurement)',
    role: 'COMPRADOR_CORP',
    business_id: 'biz-001',
    is_locked: false,
  },
  ALMACENISTA_CENTRAL: {
    id: 'usr-cedis',
    email: 'cedis@alpha.com',
    full_name: 'Ing. Fernando (Almacén Central CEDIS)',
    role: 'ALMACENISTA_CENTRAL',
    business_id: 'biz-001',
    is_locked: false,
  },
  ADMIN_SUCURSAL: {
    id: 'usr-gerente',
    email: 'gerente.centro@alpha.com',
    full_name: 'Lic. Marco Antonio (Gerente Centro)',
    role: 'ADMIN_SUCURSAL',
    business_id: 'biz-001',
    branch_id: 'branch-centro',
    is_locked: false,
    branch: {
      id: 'branch-centro',
      name: 'Sucursal Centro',
      code: 'POS-CENTRO',
      is_locked: false,
      min_consumption: 50000,
      current_month_sales: 62500,
    },
  },
  FINANZAS_SUCURSAL: {
    id: 'usr-finanzas-loc',
    email: 'finanzas.centro@alpha.com',
    full_name: 'Patricia Finanzas (Auxiliar Local)',
    role: 'FINANZAS_SUCURSAL',
    business_id: 'biz-001',
    branch_id: 'branch-centro',
    is_locked: false,
    branch: {
      id: 'branch-centro',
      name: 'Sucursal Centro',
      code: 'POS-CENTRO',
      is_locked: false,
    },
  },
  CAJERO: {
    id: 'usr-cajero',
    email: 'cajero.centro@alpha.com',
    full_name: 'Carlos Cajero (Caja 1 Centro)',
    role: 'CAJERO',
    business_id: 'biz-001',
    branch_id: 'branch-centro',
    is_locked: false,
    branch: {
      id: 'branch-centro',
      name: 'Sucursal Centro',
      code: 'POS-CENTRO',
      is_locked: false,
      min_consumption: 50000,
      current_month_sales: 62500,
    },
  },
  VENDEDOR: {
    id: 'usr-vendedor',
    email: 'vendedor.centro@alpha.com',
    full_name: 'David Vendedor (Atención & Preventa)',
    role: 'VENDEDOR',
    business_id: 'biz-001',
    branch_id: 'branch-centro',
    is_locked: false,
    branch: {
      id: 'branch-centro',
      name: 'Sucursal Centro',
      code: 'POS-CENTRO',
      is_locked: false,
    },
  },
  ALMACENISTA_SUCURSAL: {
    id: 'usr-almacen-loc',
    email: 'almacen.centro@alpha.com',
    full_name: 'Miguel Bodega (Almacén Sucursal Centro)',
    role: 'ALMACENISTA_SUCURSAL',
    business_id: 'biz-001',
    branch_id: 'branch-centro',
    is_locked: false,
  },
  CLIENTE_FINAL: {
    id: 'usr-cliente',
    email: 'cliente@correo.com',
    full_name: 'Ing. Juan Pérez (Cliente B2B)',
    role: 'CLIENTE_FINAL',
    is_locked: false,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pos_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pos_token') || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('pos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pos_user');
      localStorage.removeItem('pos_token');
    }
  }, [user]);

  const login = async (email: string, password = '123456'): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('pos_token', response.data.token);
      return true;
    } catch {
      const normalized = email.toLowerCase().trim();
      if (normalized === 'admin' || normalized === 'admin@sedesson.gob.mx' || normalized === 'superadmin') {
        const adminProfile = DEMO_PROFILES.SUPERADMIN;
        setUser(adminProfile);
        setToken(`token_${adminProfile.role}`);
        localStorage.setItem('pos_token', `token_${adminProfile.role}`);
        return true;
      }

      const matched = Object.values(DEMO_PROFILES).find(
        (u) => u.email.toLowerCase() === normalized || u.full_name.toLowerCase().includes(normalized)
      );
      if (matched) {
        setUser(matched);
        setToken(`token_${matched.role}`);
        localStorage.setItem('pos_token', `token_${matched.role}`);
        return true;
      }
      return false;
    }
  };

  const loginAsRole = (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    if (profile) {
      setUser(profile);
      setToken(`token_${role}`);
      localStorage.setItem('pos_token', `token_${role}`);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        loginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
};
