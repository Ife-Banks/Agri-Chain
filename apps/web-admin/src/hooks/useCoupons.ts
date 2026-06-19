import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  uses: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
}

function toCoupon(res: any): Coupon {
  return {
    id: res.id,
    code: res.code,
    description: res.description || '',
    discountType: res.discountType === 'percentage' ? 'percentage' : 'fixed',
    discountValue: res.discountValue || res.discount_value || 0,
    minOrder: res.minOrder || res.min_order || 0,
    maxDiscount: res.maxDiscount || res.max_discount || 0,
    uses: res.uses || 0,
    maxUses: res.maxUses || res.max_uses || 0,
    expiresAt: res.expiresAt || res.expires_at,
    isActive: res.isActive ?? res.is_active ?? true,
  };
}

export function useCoupons(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const response = await api.get('/coupons', { params });
      const result = response.data;
      return {
        coupons: (result.data || []).map(toCoupon),
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 1,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/coupons/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.post(`/coupons/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  return {
    coupons: data?.coupons || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    createCoupon: createMutation.mutate,
    updateCoupon: updateMutation.mutate,
    deleteCoupon: deleteMutation.mutate,
    toggleCouponStatus: toggleStatusMutation.mutate,
    createCouponAsync: createMutation.mutateAsync,
    updateCouponAsync: updateMutation.mutateAsync,
    deleteCouponAsync: deleteMutation.mutateAsync,
    toggleCouponStatusAsync: toggleStatusMutation.mutateAsync,
  };
}