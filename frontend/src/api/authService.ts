import { api } from './client';
import { User, UserRole } from '../types';

export const authService = {
  login: async (email: string, password = '123456'): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  createManagedUser: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    branch_id?: string;
  }): Promise<User> => {
    const response = await api.post('/auth/users', userData);
    return response.data.user;
  },
};

