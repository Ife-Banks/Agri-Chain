import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../lib/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  customerAvatar?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: string;
  phone: string;
  createdAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

function toOrder(res: any): Order {
  return {
    id: res.id,
    customer: res.customer?.name || 'Unknown',
    customerAvatar: res.customer?.avatar,
    items: res.items || [],
    subtotal: res.subtotal || 0,
    deliveryFee: res.deliveryFee || 0,
    total: res.total || 0,
    status: res.status || 'pending',
    address: res.shippingAddress || res.address || '',
    phone: res.phone || res.customer?.phone || '',
    createdAt: res.createdAt,
  };
}

export function useOrders(params?: { page?: number; limit?: number; status?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await orderApi.getOrders(params);
      return {
        orders: (response.data || []).map(toOrder),
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  return {
    orders: data?.orders || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
  };
}

export function useOrderStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['order-stats'],
    queryFn: () => orderApi.getOrderStats(),
  });

  return {
    stats: data as OrderStats | undefined,
    isLoading,
    error,
  };
}