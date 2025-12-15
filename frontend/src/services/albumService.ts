import api from './api';
import type { Album } from '../types';

/**
 * Serviciu pentru operațiuni CRUD pe albume
 */
export const albumService = {
  // Obține toate albumele
  async getAllAlbums(): Promise<Album[]> {
    const response = await api.get<Album[]>('/albums');
    return response.data;
  },

  // Obține un album după ID
  async getAlbumById(id: number): Promise<Album> {
    const response = await api.get<Album>(`/albums/${id}`);
    return response.data;
  },

  // Creează un album nou
  async createAlbum(album: Omit<Album, 'id'>): Promise<Album> {
    const response = await api.post<Album>('/albums', album);
    return response.data;
  },

  // Actualizează un album existent
  async updateAlbum(id: number, album: Partial<Album>): Promise<Album> {
    const response = await api.put<Album>(`/albums/${id}`, album);
    return response.data;
  },

  // Șterge un album
  async deleteAlbum(id: number): Promise<void> {
    await api.delete(`/albums/${id}`);
  },
};