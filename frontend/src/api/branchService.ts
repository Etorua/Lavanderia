import { api } from './client';
import { Branch } from '../types';

export const branchService = {
  listBranches: async (): Promise<Branch[]> => {
    const response = await api.get('/branches');
    return response.data;
  },

  createBranch: async (branchData: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    min_consumption?: number;
  }): Promise<Branch> => {
    const response = await api.post('/branches', branchData);
    return response.data.branch;
  },

  toggleLock: async (branchId: string, is_locked: boolean, lock_reason?: string): Promise<{ message: string; branch: Branch }> => {
    const response = await api.patch(`/branches/${branchId}/lock`, { is_locked, lock_reason });
    return response.data;
  },
};

