import { api } from './client';

export interface DirectSalePayload {
  items: Array<{ product_id: string; quantity: number }>;
  payment_method: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';
  amount_paid?: number;
  customer_name?: string;
  branch_id?: string;
}

export interface ConvertQuotationPayload {
  quotation_folio: string;
  payment_method: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';
  amount_paid?: number;
  branch_id?: string;
}

export const salesService = {
  createDirectSale: async (payload: DirectSalePayload) => {
    const response = await api.post('/sales/direct', payload);
    return response.data;
  },

  convertQuotationToSale: async (payload: ConvertQuotationPayload) => {
    const response = await api.post('/sales/convert-quotation', payload);
    return response.data;
  },

  listSales: async (params?: { branch_id?: string; date?: string }) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },
};

