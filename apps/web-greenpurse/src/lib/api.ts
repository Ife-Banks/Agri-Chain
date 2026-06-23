import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
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
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; username: string; phone: string; role: string }) =>
    api.post<{ user: any; emailVerificationToken: string }>('/auth/register', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (userId: string, token: string, newPassword: string) =>
    api.post('/auth/reset-password', { userId, token, newPassword }),
  verifyEmail: (userId: string, token: string) =>
    api.post<{ user: any; accessToken: string; refreshToken: string }>('/auth/email/verify', { userId, token }),
  resendVerification: (email: string) => api.post('/auth/email/resend', { email }),
  verifyPin: (userId: string, pin: string) => api.post<{ success: boolean }>('/auth/login/pin', { pin }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  sendOtp: (email?: string, phone?: string) =>
    api.post('/auth/otp/send', { email, phone }),
  verifyOtp: (identifier: string, otp: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: any }>('/auth/otp/verify', { identifier, otp }),
};

export const userApi = {
  getProfile: () => api.get<any>('/users/me'),
  updateProfile: (data: Partial<{ username: string; email: string; phone?: string; avatar?: string }>) =>
    api.put<any>('/users/me/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<any>('/users/me/password', { currentPassword, newPassword }),
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get<PaginatedResponse<any>>('/notifications', { params }),
  markNotificationRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

export const productApi = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) =>
    api.get<PaginatedResponse<any>>('/products', { params }),
  getProduct: (id: string) => api.get<any>(`/products/${id}`),
  getTrending: () => api.get<any>('/products/trending'),
  getFeed: () => api.get<any>('/products/feed'),
  createProduct: (data: any) => api.post<any>('/products', data),
  updateProduct: (id: string, data: any) => api.patch<any>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

export const orderApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<any>>('/orders', { params }),
  getOrder: (id: string) => api.get<any>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string) =>
    api.patch<any>(`/orders/${id}/status`, { status }),
  createOrder: (data: any) => api.post<any>('/orders', data),
  getCart: () => api.get<any>('/cart'),
  addCartItem: (data: { productId: string; quantity: number }) =>
    api.post<any>('/cart/items', data),
  updateCartItem: (itemId: string, data: { quantity: number }) =>
    api.patch<any>(`/cart/items/${itemId}`, data),
  applyCoupon: (data: { code: string }) => api.post<any>('/cart/coupon', data),
};

export const categoryApi = {
  getCategories: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>('/categories', { params }),
  getCategory: (id: string) => api.get<any>(`/categories/${id}`),
  createCategory: (data: { name: string; description?: string; icon?: string }) =>
    api.post<any>('/categories', data),
  updateCategory: (id: string, data: { name?: string; description?: string; icon?: string }) =>
    api.put<any>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

export const storeApi = {
  getStores: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>('/stores', { params }),
  getStore: (id: string) => api.get<any>(`/stores/${id}`),
  getMyStore: () => api.get<any>('/stores/farmer/me'),
  createStore: (data: any) => api.post<any>('/stores', data),
  updateStore: (id: string, data: any) => api.put<any>(`/stores/${id}`, data),
  deleteStore: (id: string) => api.delete(`/stores/${id}`),
};

export const couponApi = {
  getCoupons: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedResponse<any>>('/coupons', { params }),
  getCoupon: (id: string) => api.get<any>(`/coupons/${id}`),
  createCoupon: (data: { code: string; type: 'percentage' | 'fixed'; value: number; minOrderValue?: number; maxDiscount?: number; expiresAt?: string }) =>
    api.post<any>('/coupons', data),
  updateCoupon: (id: string, data: any) => api.put<any>(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
  validateCoupon: (code: string) => api.post<any>('/coupons/validate', { code }),
};

export const walletApi = {
  getWallet: () => api.get<any>('/wallet'),
  getTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get<PaginatedResponse<any>>('/wallet/transactions', { params }),
  deposit: (data: { amount: number; idempotencyKey?: string }) =>
    api.post<any>('/wallet/deposit', data),
  withdraw: (data: { amount: number; bank: string; accountNumber: string; accountName: string }) =>
    api.post<any>('/wallet/withdraw', data),
  transfer: (data: { recipientWalletId: string; amount: number; note?: string; idempotencyKey?: string }) =>
    api.post<any>('/wallet/transfer', data),
  setBankAccount: (data: { bank: string; accountNumber: string; accountName: string }) =>
    api.post<any>('/wallet/bank', data),
  addBeneficiary: (data: { bank: string; accountNumber: string; accountName: string }) =>
    api.post<any>('/wallet/beneficiaries', data),
  removeBeneficiary: (id: string) => api.delete(`/wallet/beneficiaries/${id}`),
  setPin: (pin: string) => api.post<any>('/wallet/pin', { pin }),
  verifyPin: (pin: string) => api.post<{ valid: boolean }>('/wallet/verify-pin', { pin }),
  toggleFreeze: (freeze: boolean, pin: string) =>
    api.post<any>('/wallet/freeze', { freeze, pin }),
  generateQr: (data: { amount?: number; expiresInMinutes?: number }) =>
    api.post<any>('/wallet/qr/generate', data),
  validateQr: (token: string, amount?: number) =>
    api.post<any>('/wallet/qr/validate', { token, amount }),
};

export const addressApi = {
  getAddresses: () => api.get<any[]>('/addresses'),
  createAddress: (data: { label: string; street: string; city: string; state: string; postalCode?: string; country?: string; isDefault?: boolean }) =>
    api.post<any>('/addresses', data),
  updateAddress: (id: string, data: { label?: string; street?: string; city?: string; state?: string; postalCode?: string; country?: string; isDefault?: boolean }) =>
    api.put<any>(`/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch(`/addresses/${id}/default`),
};

export const logisticsApi = {
  getDrivers: (params?: { page?: number; limit?: number; availableOnly?: boolean }) =>
    api.get<PaginatedResponse<any>>('/logistics/drivers', { params }),
  createDriver: (data: any) => api.post<any>('/logistics/drivers', data),
  getVehicles: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<any>>('/logistics/vehicles', { params }),
  createVehicle: (data: any) => api.post<any>('/logistics/vehicles', data),
  getBatches: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<PaginatedResponse<any>>('/logistics/batches', { params }),
  getBatch: (id: string) => api.get<any>(`/logistics/batches/${id}`),
  assignBatch: (id: string, data: { driverId: string; vehicleId: string }) =>
    api.patch<any>(`/logistics/batches/${id}/assign`, data),
  updateBatchStatus: (id: string, data: { status: string }) =>
    api.patch<any>(`/logistics/batches/${id}/status`, data),
  getTracking: (batchId: string) => api.get<any[]>(`/logistics/batches/${batchId}/tracking`),
  pushTracking: (batchId: string, data: { lat: number; lng: number; speedKmh?: number; status?: string }) =>
    api.post<any>(`/logistics/batches/${batchId}/tracking`, data),
};

export const storageApi = {
  upload: (file: File) => api.upload<{ key: string; url: string; size: number }>('/storage/upload', file),
  deleteFile: (key: string) => api.delete(`/storage/files/${key}`),
};

export const aiApi = {
  detectDisease: (file: File, data: { cropType?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (data.cropType) formData.append('cropType', data.cropType);
    return api.post<any>('/ai/detect-disease', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  pricePrediction: (data: { commodityId: string; days?: number }) =>
    api.post<any>('/ai/price-prediction', data),
  cropRecommendation: (data: { location: string; soilType?: string; budget?: number; season?: string }) =>
    api.post<any>('/ai/crop-recommendation', data),
  getMarketInsights: () => api.get<any>('/ai/market-insights'),
  chat: (data: { message: string }) => api.post<any>('/ai/chat', data),
};

export default api;