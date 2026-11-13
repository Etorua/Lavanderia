import { api } from './client';
import { CashCut } from '../types';

export const cashCutService = {
  openCashCut: async (initial_cash: number, branch_id?: string): Promise<CashCut> => {
    const response = await api.post('/cash-cuts/open', { initial_cash, branch_id });
    return response.data.cashCut;
  },

  getCurrent: async (branch_id?: string): Promise<CashCut> => {
    const response = await api.get('/cash-cuts/current', { params: { branch_id } });
    return response.data;
  },

  closeCashCut: async (id: string, actual_cash_counted: number, notes?: string) => {
    const response = await api.post(`/cash-cuts/close/${id}`, { actual_cash_counted, notes });
    return response.data;
  },

  auditCashCut: async (id: string, audit_notes?: string) => {
    const response = await api.post(`/cash-cuts/audit/${id}`, { audit_notes });
    return response.data;
  },

  createExpense: async (payload: { concept: string; amount: number; receipt_url?: string; branch_id?: string }) => {
    const response = await api.post('/cash-cuts/expenses', payload);
    return response.data.expense;
  },
};

