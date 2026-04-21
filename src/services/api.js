// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена в каждый запрос
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

// --- Аутентификация ---
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// --- Персонажи ---
export const charactersAPI = {
  getAll: () => api.get('/characters/'),
  getById: (id) => api.get(`/characters/${id}`),
  create: (character) => api.post('/characters/', character),
  update: (id, character) => api.put(`/characters/${id}`, character),
  delete: (id) => api.delete(`/characters/${id}`),
};

export default api;