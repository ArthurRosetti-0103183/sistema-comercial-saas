/**
 * API - Configuração de requisições
 */
const API_URL = '/api';

const api = {
  getToken: () => localStorage.getItem('token'),
  
  headers: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }),

  async get(endpoint, params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const url = qs ? `${API_URL}${endpoint}?${qs}` : `${API_URL}${endpoint}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: this.headers()
      });
      if (res.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na requisição');
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na requisição');
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.headers(),
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na requisição');
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.headers()
      });
      if (res.status === 401) {
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na requisição');
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  }
};
