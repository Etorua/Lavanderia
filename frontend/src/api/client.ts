import axios from 'axios';

// Cliente Axios con URL base relativa hacia el proxy de Vite o puerto 4000
export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar automáticamente el Bearer Token guardado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para detectar errores 403 de Candado Comercial
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.locked_entity) {
      console.warn('Operación bloqueada por Candado Comercial:', error.response.data);
    }
    return Promise.reject(error);
  }
);

