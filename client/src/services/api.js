// src/services/api.js - All API calls to the backend
import axios from 'axios';

// Base URL - uses environment variable in production, proxy in development
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || ''
});

// ===== AUTH =====
export const login = (data) => API.post('/api/auth/login', data);
export const register = (data) => API.post('/api/auth/register', data);

// ===== PROJECTS =====
export const getProjects = () => API.get('/api/projects');
export const getMyProjects = (userId) => API.get(`/api/projects/my/${userId}`);
export const createProject = (data) => API.post('/api/projects', data);
export const deleteProject = (id) => API.delete(`/api/projects/${id}`);

// ===== TASKS =====
export const getAllTasks = () => API.get('/api/tasks');
export const getMyTasks = (userId) => API.get(`/api/tasks/my/${userId}`);
export const createTask = (data) => API.post('/api/tasks', data);
export const updateTask = (id, data) => API.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/api/tasks/${id}`);
export const getSuggestedEmployees = (role) =>
  API.get('/api/tasks/suggest', { params: role ? { role } : {} });
export const getAnalytics = () => API.get('/api/tasks/analytics');

// ===== USERS =====
export const getEmployees = () => API.get('/api/users/employees');
export const getAllUsers = () => API.get('/api/users');
export const deleteUser = (id) => API.delete(`/api/users/${id}`);

// ===== NOTIFICATIONS =====
export const getNotifications = (userId) => API.get(`/api/notifications/${userId}`);
export const markNotificationRead = (id) => API.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = (userId) => API.put(`/api/notifications/all/${userId}/read`);
