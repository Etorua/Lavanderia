import { api } from './client';

export const analyticsService = {
  getReorderSuggestions: async () => {
    const response = await api.get('/analytics/reorder-suggestions');
    return response.data;
  },

  getTopRotation: async () => {
    const response = await api.get('/analytics/rotation/top');
    return response.data;
  },

  getDeadStock: async () => {
    const response = await api.get('/analytics/rotation/dead-stock');
    return response.data;
  },

  getCommercialLockStatus: async () => {
    const response = await api.get('/analytics/commercial-lock-status');
    return response.data;
  },
};

