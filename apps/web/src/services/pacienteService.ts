// src/services/pacienteService.ts
import axios from 'axios';

export interface Paciente {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
  cpf: string;
  gender: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  birth_date?: string;
  phone?: string;
  address?: string;
  initial_observations: string | null;
  history: string | null;
  status: 'ATIVO' | 'ACOMPANHAMENTO' | 'ALTA' | 'INATIVO';
  psicologo_responsavel_id: string | null;
  last_session?: string | null;
}

export type ConsultaStatusApi = 'CONFIRMADO' | 'CANCELADO' | 'A_CONFIRMAR' | 'CONCLUIDA';

export interface ConsultaResumo {
  id: string;
  paciente_id: string;
  horario: string;
  tipo: string;
  categoria: string;
  tags: string[];
  status: ConsultaStatusApi;
  sugestao_IA?: string | null;
  transcricao?: string | null;
  anotacoes?: string | null;
  created_at: string;
  updatedAt: string;
}

export interface PacienteDetails extends Paciente {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photo_url?: string | null;
  };
  consultas?: ConsultaResumo[];
}

export interface Transcricao {
  id: string;
  texto_gerado: string | null;
  data_geracao: string;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDA' | 'ERRO';
  created_at: string;
  updatedAt: string;
}

// Normalizar URL do backend
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_DB_HOST;
  if (!envUrl) return 'http://127.0.0.1:3001';
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

export const pacienteService = {
  // ===============================
  // Pacientes
  // ===============================
  async listPacientes(token?: string): Promise<Paciente[]> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get<Paciente[]>('/users/patients', config);
    return response.data;
  },

  async getPacienteById(id: string, token: string): Promise<PacienteDetails> {
    const response = await api.get<PacienteDetails>(`/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createPaciente(data: { name: string; email: string; password: string; cpf: string; gender: 'MASCULINO' | 'FEMININO' | 'OUTRO' }, token: string) {
    const response = await api.post('/users/patients', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updatePaciente(id: string, data: Partial<Paciente>, token?: string) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.patch(`/patients/${id}`, data, config);
    return response.data;
  },

  // ===============================
  // Sessões
  // ===============================
  // ===============================
  // Transcrições
  // ===============================
  async getTranscricaoById(id: string, token: string): Promise<Transcricao> {
    const response = await api.get<Transcricao>(`/transcricoes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createTranscricao(data: Partial<Transcricao>, token: string): Promise<Transcricao> {
    const response = await api.post<Transcricao>(`/transcricoes`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateTranscricao(id: string, data: Partial<Transcricao>, token: string): Promise<Transcricao> {
    const response = await api.put<Transcricao>(`/transcricoes/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteTranscricao(id: string, token: string) {
    const response = await api.delete(`/transcricoes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
