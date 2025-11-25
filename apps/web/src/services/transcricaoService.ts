// src/services/transcricaoService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DB_HOST || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

export interface Transcricao {
  id: string;
  texto_gerado: string | null;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDA' | 'ERRO';
  data_geracao: string;
}

export const transcricaoService = {
  async createTranscricao(texto_gerado: string, token?: string): Promise<Transcricao> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post('/transcricoes', { texto_gerado, status: 'CONCLUIDA' }, config);
    return response.data;
  },

  async updateTranscricao(id: string, data: Partial<Transcricao>, token?: string): Promise<Transcricao> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/transcricoes/${id}`, data, config);
    return response.data;
  },

  async getTranscricao(id: string, token?: string): Promise<Transcricao> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/transcricoes/${id}`, config);
    return response.data;
  }
};
