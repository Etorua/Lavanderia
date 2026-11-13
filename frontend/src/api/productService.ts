import { api } from './client';
import { Product } from '../types';

export const productService = {
  listPublic: async (params?: { search?: string; category?: string }): Promise<Product[]> => {
    const response = await api.get('/products/public', { params });
    return response.data;
  },

  getByQR: async (code: string): Promise<Product> => {
    const response = await api.get(`/products/qr/${encodeURIComponent(code)}`);
    return response.data;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data.product;
  },
};

