// src/services/userService.ts
import axios from 'axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photo_url: string | null;
  role: 'PSICOLOGO' | 'PACIENTE';
  account_status: string;
  created_at: string;
  updatedAt: string;
  psicologo?: {
    userId: string;
    crp: string;
    bio: string | null;
    schedule_settings: any | null;
  };
  paciente?: {
    userId: string;
    cpf: string | null;
    gender: 'MASCULINO' | 'FEMININO' | 'OUTRO';
    initial_observations: string | null;
    history: string | null;
    status: string;
  };
}

export interface UpdateUserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  bio?: string;
  schedule_settings?: any;
}

// Normalizar URL do backend
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_DB_HOST;
  if (!envUrl) return 'http://localhost:3001';
  let url = envUrl.trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = `http://${url}`;
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const userService = {
  async getProfile(token: string): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateProfile(data: UpdateUserProfileData, token: string): Promise<{ message: string; user: any }> {
    const response = await api.patch('/users/me', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

