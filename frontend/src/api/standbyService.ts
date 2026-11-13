import { api } from './client';
import { StandbyTicket, CartItem } from '../types';

export const standbyService = {
  saveStandbyTicket: async (reference_name: string, cart_data: CartItem[], branch_id?: string): Promise<StandbyTicket> => {
    const response = await api.post('/standby', { reference_name, cart_data, branch_id });
    return response.data.ticket;
  },

  listStandbyTickets: async (branch_id?: string): Promise<StandbyTicket[]> => {
    const response = await api.get('/standby', { params: { branch_id } });
    return response.data;
  },

  deleteStandbyTicket: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/standby/${id}`);
    return response.data;
  },
};

