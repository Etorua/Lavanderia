import { api } from './client';
import { Quotation } from '../types';

export interface CreateQuotationPayload {
  client_name: string;
  client_contact?: string;
  items: Array<{ product_id: string; quantity: number; unit_price?: number }>;
  reserves_stock?: boolean;
  branch_id?: string;
}

export const quotationService = {
  createQuotation: async (payload: CreateQuotationPayload): Promise<Quotation> => {
    const response = await api.post('/quotations', payload);
    return response.data.quotation;
  },

  getByFolio: async (folio: string): Promise<Quotation> => {
    const response = await api.get(`/quotations/by-folio/${encodeURIComponent(folio)}`);
    return response.data;
  },

  releaseReservation: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/quotations/release/${id}`);
    return response.data;
  },

  listQuotations: async (params?: { status?: string; search?: string }): Promise<Quotation[]> => {
    const response = await api.get('/quotations', { params });
    return response.data;
  },
};

