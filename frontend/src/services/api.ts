import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

// Credentials endpoints
export const credentialsAPI = {
  getAll: () => api.get('/credentials'),
  create: (data: { platform_name: string; email: string; password: string }) =>
    api.post('/credentials', data),
  update: (id: number, data: { platform_name: string; email: string; password: string }) =>
    api.put(`/credentials/${id}`, data),
  delete: (id: number) => api.delete(`/credentials/${id}`),
};

// Session endpoints
export const sessionAPI = {
  save: (data: { platform_name: string; cookies_json: string; expires_at?: string }) =>
    api.post('/platform/session', data),
  get: (platform: string) => api.get(`/platform/session/${platform}`),
  getAll: () => api.get('/platform/session/'),
  delete: (platform: string) => api.delete(`/platform/session/${platform}`),
};

// Hackathons endpoints
export const hackathonsAPI = {
  getAll: (skip?: number, limit?: number) =>
    api.get('/hackathons', { params: { skip, limit } }),
  search: (query: string) =>
    api.post('/hackathons/search', { query }),
  register: (teamId: number, hackathonId: number) =>
    api.post('/hackathons/register', { team_id: teamId, hackathon_id: hackathonId }),
  getRegistered: () => api.get('/hackathons/registered'),
};

// Teams endpoints
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  create: (data: any) => api.post('/teams', data),
  getById: (id: number) => api.get(`/teams/${id}`),
};

export default api;
