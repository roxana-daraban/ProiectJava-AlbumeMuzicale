import api from './api';
import type { User, UpdateRoleRequest } from '../types';

/**
 * Serviciu pentru operațiuni pe useri (ADMIN only)
 */
export const userService = {
  // Obține toți userii
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Obține un user după ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Actualizează rolul unui user
  async updateUserRole(id: number, role: string): Promise<User> {
    const response = await api.put<User>(`/users/${id}/role`, { role } as UpdateRoleRequest);
    return response.data;
  },

  // Șterge un user
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

