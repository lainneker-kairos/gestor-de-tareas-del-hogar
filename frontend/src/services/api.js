import axios from 'axios';

// Soporta ambos nombres de variable de entorno
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://gestor-de-tareas-del-hogar.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT en las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/api/auth/users');
    return res.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },
  uploadAvatar: async (formData) => {
    const res = await api.post('/api/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  updateAvatarUrl: async (avatarUrl) => {
    const res = await api.post('/api/auth/avatar', { avatar_url: avatarUrl });
    return res.data;
  },
};

export const taskService = {
  getCatalog: async () => {
    const res = await api.get('/api/tasks/catalog');
    return res.data;
  },
  createCatalogItem: async (catalogData) => {
    const res = await api.post('/api/tasks/catalog', catalogData);
    return res.data;
  },
  getTasks: async (all = false) => {
    const res = await api.get(`/api/tasks?all=${all}`);
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await api.post('/api/tasks', taskData);
    return res.data;
  },
  updateTask: async (taskId, taskData) => {
    const res = await api.patch(`/api/tasks/${taskId}`, taskData);
    return res.data;
  },
  toggleTask: async (taskId) => {
    const res = await api.patch(`/api/tasks/${taskId}/toggle`);
    return res.data;
  },
  deleteTask: async (taskId) => {
    const res = await api.delete(`/api/tasks/${taskId}`);
    return res.data;
  },
};

export const scheduleService = {
  getSchedules: async (all = false, userId = null) => {
    let url = `/api/schedules?all=${all}`;
    if (userId) url += `&user_id=${userId}`;
    const res = await api.get(url);
    return res.data;
  },
  createSchedule: async (scheduleData) => {
    const res = await api.post('/api/schedules', scheduleData);
    return res.data;
  },
  uploadScheduleFile: async (formData) => {
    const res = await api.post('/api/schedules/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteSchedule: async (scheduleId) => {
    const res = await api.delete(`/api/schedules/${scheduleId}`);
    return res.data;
  },
};

export const settingsService = {
  getMotivationalMessage: async () => {
    const res = await api.get('/api/settings/motivational_message');
    return res.data;
  },
  updateMotivationalMessage: async (message) => {
    const res = await api.post('/api/settings/motivational_message', { message });
    return res.data;
  },
};

export default api;