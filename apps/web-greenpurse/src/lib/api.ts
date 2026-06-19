import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token && config.headers) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async upload<T>(url: string, file: File, fieldName = 'file') {
    const formData = new FormData();
    formData.append(fieldName, file);
    const response = await this.client.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const api = new ApiService();

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export function getApiError(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: any }>('/api/auth/login', { email, password }),
  register: (data: { email: string; password: string; username: string; role?: string }) => api.post<{ token: string; user: any }>('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: (refreshToken: string) => api.post<{ token: string }>('/api/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/api/auth/reset-password', { token, password }),
  enable2FA: () => api.post<{ qrCode: string }>('/api/auth/2fa/enable'),
  verify2FA: (code: string) => api.post<{ success: boolean }>('/api/auth/2fa/verify', { code }),
  disable2FA: (code: string) => api.post('/api/auth/2fa/disable', { code }),
};

export const userApi = {
  getProfile: () => api.get<any>('/api/users/me'),
  updateProfile: (data: Partial<{ username: string; email: string; phone?: string; avatar?: string }>) => api.patch<any>('/api/users/me', data),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/api/users/change-password', { currentPassword, newPassword }),
  getNotifications: (params?: { page?: number; limit?: number; read?: boolean }) => api.get<PaginatedResponse<any>>('/api/notifications', { params }),
  markNotificationRead: (id: string) => api.patch(`/api/notifications/${id}`, { read: true }),
  markAllNotificationsRead: () => api.post('/api/notifications/mark-all-read'),
  deleteNotification: (id: string) => api.delete(`/api/notifications/${id}`),
};

export const productApi = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/products', { params }),
  getProduct: (id: string) => api.get<any>(`/api/products/${id}`),
  createProduct: (data: any) => api.post<any>('/api/products', data),
  updateProduct: (id: string, data: any) => api.put<any>(`/api/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/api/products/${id}`),
  updateProductStatus: (id: string, status: 'active' | 'inactive') => api.patch<any>(`/api/products/${id}`, { status }),
};

export const orderApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/orders', { params }),
  getOrder: (id: string) => api.get<any>(`/api/orders/${id}`),
  updateOrderStatus: (id: string, status: string) => api.patch<any>(`/api/orders/${id}`, { status }),
  getOrderStats: () => api.get<any>('/api/orders/stats'),
};

export const categoryApi = {
  getCategories: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/categories', { params }),
  getCategory: (id: string) => api.get<any>(`/api/categories/${id}`),
  createCategory: (data: { name: string; description?: string; icon?: string }) => api.post<any>('/api/categories', data),
  updateCategory: (id: string, data: { name?: string; description?: string; icon?: string; status?: string }) =>
    api.put<any>(`/api/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/api/categories/${id}`),
  toggleCategoryStatus: (id: string) => api.post<any>(`/api/categories/${id}/toggle-status`),
};

export const storeApi = {
  getStores: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/stores', { params }),
  getStore: (id: string) => api.get<any>(`/api/stores/${id}`),
  createStore: (data: any) => api.post<any>('/api/stores', data),
  updateStore: (id: string, data: any) => api.put<any>(`/api/stores/${id}`, data),
  deleteStore: (id: string) => api.delete(`/api/stores/${id}`),
  toggleStoreStatus: (id: string) => api.post<any>(`/api/stores/${id}/toggle-status`),
};

export const couponApi = {
  getCoupons: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/coupons', { params }),
  getCoupon: (id: string) => api.get<any>(`/api/coupons/${id}`),
  createCoupon: (data: { code: string; type: 'percentage' | 'fixed'; value: number; minOrder?: number; maxDiscount?: number; expiresAt?: string; status?: string }) =>
    api.post<any>('/api/coupons', data),
  updateCoupon: (id: string, data: any) => api.put<any>(`/api/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/api/coupons/${id}`),
  toggleCouponStatus: (id: string) => api.post<any>(`/api/coupons/${id}/toggle-status`),
};

export const walletApi = {
  getWallet: () => api.get<any>('/api/wallet'),
  getTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get<PaginatedResponse<any>>('/api/wallet/transactions', { params }),
  topUp: (amount: number, method: string) => api.post<any>('/api/wallet/top-up', { amount, method }),
  withdraw: (amount: number, method: string) => api.post<any>('/api/wallet/withdraw', { amount, method }),
};

export const logisticsApi = {
  getDrivers: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/logistics/drivers', { params }),
  createDriver: (data: any) => api.post<any>('/api/logistics/drivers', data),
  updateDriver: (id: string, data: any) => api.put<any>(`/api/logistics/drivers/${id}`, data),
  deleteDriver: (id: string) => api.delete(`/api/logistics/drivers/${id}`),

  getVehicles: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/logistics/vehicles', { params }),
  createVehicle: (data: any) => api.post<any>('/api/logistics/vehicles', data),
  updateVehicle: (id: string, data: any) => api.put<any>(`/api/logistics/vehicles/${id}`, data),
  deleteVehicle: (id: string) => api.delete(`/api/logistics/vehicles/${id}`),

  getBatches: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<any>>('/api/logistics/batches', { params }),
  createBatch: (data: any) => api.post<any>('/api/logistics/batches', data),
  updateBatch: (id: string, data: any) => api.put<any>(`/api/logistics/batches/${id}`, data),
};

export const storageApi = {
  upload: (file: File) => api.upload<{ url: string }>('/api/storage/upload', file),
};

export default api;