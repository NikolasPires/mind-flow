import axios from 'axios';

export interface Transcricao {
  id: string;
  id_consulta: string;
  texto_gerado: string | null;
  data_geracao: string | null;
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDA' | 'ERRO';
}

export interface Consulta {
  id: string;
  paciente_id: string;
  paciente?: {
    name: string;
  } | null;
  horario: string;
  tipo: string;
  categoria: string;
  tags: string[];
  status: 'CONFIRMADO' | 'CANCELADO' | 'A_CONFIRMAR';
  sugestao_IA?: string | null;
  transcricao_id?: string | null;
  created_at: string;
  updatedAt: string;
}

export interface CreateConsultaData {
  paciente_id: string;
  horario: string; // ISO string
  tipo: string;
  categoria: string;
  tags: string[];
  status?: 'CONFIRMADO' | 'CANCELADO' | 'A_CONFIRMAR';
  sugestao_IA?: string;
  transcricao_id?: string;
}

export interface UpdateConsultaData {
  paciente_id?: string;
  horario?: string; // ISO string
  tipo?: string;
  categoria?: string;
  tags?: string[];
  status?: 'CONFIRMADO' | 'CANCELADO' | 'A_CONFIRMAR';
  sugestao_IA?: string;
  transcricao_id?: string;
}

// Normalizar a URL do backend (remove trailing slash e garante http://)
const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_DB_HOST;
  if (!envUrl) return 'http://127.0.0.1:3001';
  
  let url = envUrl.trim();
  // Remove trailing slash
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // Garante que começa com http:// ou https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  // Para desenvolvimento local, força http:// mesmo se configurado como https://
  if (url.includes('127.0.0.1') || url.includes('127.0.0.1')) {
    url = url.replace('https://', 'http://');
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Erro de conexão: O servidor backend não está acessível em', getBaseURL());
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    }
    throw error;
  }
);

export const consultaService = {
  async listConsultas(token?: string): Promise<Consulta[]> {
    try {
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      } : {};
      const response = await api.get<Consulta[]>('/consultas', config);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar consultas:', error);
      if (error.response) {
        // Erro do servidor
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Requisição feita mas sem resposta
        throw new Error('O servidor não respondeu. Verifique se o backend está rodando.');
      } else {
        // Erro ao montar a requisição
        throw new Error(error.message || 'Erro ao fazer requisição');
      }
    }
  },

  async createConsulta(data: CreateConsultaData, token?: string): Promise<Consulta> {
    try {
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      } : {};
      const response = await api.post<Consulta>('/consultas', data, config);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar consulta:', error);
      if (error.response) {
        // Erro do servidor
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // Requisição feita mas sem resposta
        throw new Error('O servidor não respondeu. Verifique se o backend está rodando.');
      } else {
        // Erro ao montar a requisição
        throw new Error(error.message || 'Erro ao fazer requisição');
      }
    }
  },

  async updateConsulta(id: string, data: UpdateConsultaData, token?: string): Promise<Consulta> {
    try {
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      } : {};
      const response = await api.put<Consulta>(`/consultas/${id}`, data, config);
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar consulta:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('O servidor não respondeu. Verifique se o backend está rodando.');
      } else {
        throw new Error(error.message || 'Erro ao fazer requisição');
      }
    }
  },

  async deleteConsulta(id: string, token?: string): Promise<void> {
    try {
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      } : {};
      await api.delete(`/consultas/${id}`, config);
    } catch (error: any) {
      console.error('Erro ao deletar consulta:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('O servidor não respondeu. Verifique se o backend está rodando.');
      } else {
        throw new Error(error.message || 'Erro ao fazer requisição');
      }
    }
  },
};