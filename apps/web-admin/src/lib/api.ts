import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

async function refreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh();
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`,
      { refreshToken }
    );
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export const authApi = {
  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { username: string; email: string; phone: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/users/me'),
};

export const adminApi = {
  dashboard: (params?: { from?: string; to?: string }) =>
    api.get('/admin/dashboard', { params }),
  analytics: () => api.get('/admin/analytics'),

  users: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
      api.get('/admin/users', { params }),
    getById: (id: string) => api.get(`/admin/users/${id}`),
    create: (data: any) => api.post('/admin/users', data),
    update: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
    delete: (id: string) => api.delete(`/admin/users/${id}`),
  },

  products: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) =>
      api.get('/admin/products', { params }),
    getById: (id: string) => api.get(`/admin/products/${id}`),
    create: (data: any) => api.post('/admin/products', data),
    update: (id: string, data: any) => api.patch(`/admin/products/${id}`, data),
    delete: (id: string) => api.delete(`/admin/products/${id}`),
  },

  orders: {
    getAll: (params?: { page?: number; limit?: number; status?: string }) =>
      api.get('/admin/orders', { params }),
    getById: (id: string) => api.get(`/admin/orders/${id}`),
    updateStatus: (id: string, data: { status: string }) =>
      api.patch(`/admin/orders/${id}/status`, data),
  },
};

export const categoriesApi = {
  getAll: (params?: { search?: string }) =>
    api.get('/categories', { params }),
  getById: (id: string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

export const adminStores = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isVerified?: boolean }) =>
    api.get('/admin/stores', { params }),
  getById: (id: string) => api.get(`/admin/stores/${id}`),
  verify: (id: string) => api.patch(`/admin/stores/${id}/verify`),
  deactivate: (id: string) => api.patch(`/admin/stores/${id}/deactivate`),
};

export const adminNotifications = {
  broadcast: (data: { type: string; title: string; body: string }) =>
    api.post('/notifications/admin/broadcast', data),
  cleanup: (days?: number) =>
    api.delete(`/notifications/cleanup?days=${days || 30}`),
};

export const settingsApi = {
  profile: {
    get: () => api.get('/users/me'),
    update: (data: { username?: string; phoneNumber?: string; avatarUrl?: string }) =>
      api.put('/users/me/profile', data),
  },
  password: {
    change: (data: { currentPassword: string; newPassword: string }) =>
      api.put('/users/me/password', data),
  },
  pin: {
    set: (data: { newPin: string; oldPin?: string }) =>
      api.put('/auth/pin', data),
  },
  notifications: {
    list: (params?: { page?: number; limit?: number }) =>
      api.get('/notifications', { params }),
    markRead: (id: string) =>
      api.patch(`/notifications/${id}/read`),
    markAllRead: () =>
      api.patch('/notifications/read-all'),
    unreadCount: () =>
      api.get('/notifications/unread-count'),
  },
};

export const usersApi = adminApi.users;
export const productsApi = adminApi.products;
export const ordersApi = adminApi.orders;
export const analyticsApi = {
  getRevenue: () => api.get('/admin/analytics'),
  getOrders: () => api.get('/admin/analytics'),
  getProducts: () => api.get('/admin/analytics'),
  getCustomers: () => api.get('/admin/analytics'),
};

export default api;