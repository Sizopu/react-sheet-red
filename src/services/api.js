import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (username, password) => {
    // OAuth2 требует application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
};

export const charactersAPI = {
  getAll: () => api.get('/characters/'),
  getById: (id) => api.get(`/characters/${id}`),
  create: (character) => api.post('/characters/', character),
  update: (id, character) => api.put(`/characters/${id}`, character),
  delete: (id) => api.delete(`/characters/${id}`),
};

export default api;