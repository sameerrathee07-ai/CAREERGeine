import axios from 'axios';
import { getIdToken } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  googleSignIn: (idToken) => api.post('/auth/google', { idToken }),
  setRole: (role) => api.post('/auth/set-role', { role }),
  verifyToken: (idToken) => api.post('/auth/verify-token', { idToken }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  sendVerification: () => api.post('/auth/send-verification'),
  getProfile: () => api.get('/auth/profile'),
  deleteAccount: () => api.delete('/auth/account'),
};

export const usersApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/users/password', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getActivity: () => api.get('/users/activity'),
  exportData: () => api.get('/users/export'),
};

export const resumesApi = {
  upload: (formData) =>
    api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/resumes', { params }),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
  analyze: (id) => api.post(`/resumes/${id}/analyze`),
};

export const jobsApi = {
  create: (data) => api.post('/jobs', data),
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  save: (id) => api.post(`/jobs/${id}/save`),
  unsave: (id) => api.delete(`/jobs/${id}/save`),
  getSaved: (params) => api.get('/jobs/saved', { params }),
};

export const applicationsApi = {
  create: (data) => api.post('/applications', data),
  getAll: (params) => api.get('/applications', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  shortlist: (id) => api.post(`/applications/${id}/shortlist`),
};

export const notificationsApi = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetail: (id) => api.get(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  suspendUser: (id) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  approveRecruiter: (id) => api.post(`/admin/recruiters/${id}/approve`),
  moderateJob: (id, status) => api.patch(`/admin/jobs/${id}/moderate`, { status }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export const feedbackApi = {
  create: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  updateStatus: (id, status) => api.patch(`/feedback/${id}/status`, { status }),
};

export const contactApi = {
  create: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  updateStatus: (id, status) => api.patch(`/contact/${id}/status`, { status }),
};

export const helpApi = {
  getArticles: (params) => api.get('/help/articles', { params }),
  getArticle: (id) => api.get(`/help/articles/${id}`),
  getCategories: () => api.get('/help/categories'),
};

export default api;
