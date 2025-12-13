import axios from 'axios';

// Creăm instanța axios cu configurație de bază
const api = axios.create({
  baseURL: '/api', // Vite proxy va redirecționa către http://localhost:8080/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pentru a adăuga token-ul la fiecare request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pentru a gestiona erorile 401 (token expirat)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirat sau invalid - ștergem token-ul și redirecționăm la login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;