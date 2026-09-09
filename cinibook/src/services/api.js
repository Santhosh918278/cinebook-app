import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Movies
export const moviesAPI = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  search: (query) => api.get('/movies/search', { params: { q: query } }),
};

// Shows
export const showsAPI = {
  getByMovie: (movieId) => api.get('/shows', { params: { movie_id: movieId } }),
  getById: (id) => api.get(`/shows/show/${id}`),
};

// Seats
export const seatsAPI = {
  getByShow: (showId) => api.get(`/shows/${showId}/seats`),
};

// Bookings
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
};

// Payments
export const paymentsAPI = {
  create: (data) => api.post('/payments', data),
};

// Admin
export const adminAPI = {
  createMovie: (data) => api.post('/admin/movies', data),
  createTheater: (data) => api.post('/admin/theaters', data),
  createScreen: (data) => api.post('/admin/screens', data),
  createShow: (data) => api.post('/admin/shows', data),
};

export default api;
