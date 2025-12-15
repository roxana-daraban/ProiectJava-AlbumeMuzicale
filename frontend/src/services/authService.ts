import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types';

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  // Logout (doar șterge token-ul din localStorage)
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verifică dacă utilizatorul este autentificat
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obține token-ul
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Salvează datele utilizatorului
  saveUser(user: { username: string; role: string; token: string; userId: number }): void {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify({ id: user.userId, username: user.username, role: user.role }));
  },

  // Obține datele utilizatorului
  getUser(): { id: number; username: string; role: string } | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};