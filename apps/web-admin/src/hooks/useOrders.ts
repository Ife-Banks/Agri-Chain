import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../lib/api';
import { useAdminStore } from '../store/adminStore';

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

function toOrder(res: any): Order {
  return {
    id: res.id,
    customer: res.user?.username || res.user?.email || 'Unknown',
    email: res.user?.email || '',
    total: Number(res.grandTotal) || 0,
    status: formatStatus(res.status),
    date: res.createdAt ? new Date(res.createdAt).toISOString().slice(0, 10) : '',
  };
}

function formatStatus(status: string): Order['status'] {
  const map: Record<string, Order['status']> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return map[status] || 'Pending';
}

export function useOrders(params?: { page?: number; limit?: number; status?: string }) {
  const queryClient = useQueryClient();
  const { setOrders, updateOrder } = useAdminStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      try {
        const response = await ordersApi.getAll(params);
        const result = response.data;
        const orders = (result.data || []).map(toOrder);
        setOrders(orders);
        return { ...result, data: orders };
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return { data: [], total: 0, page: 1, limit: 20 };
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: (response, variables) => {
      updateOrder(variables.id, toOrder(response.data));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    isLoading,
    error,
    updateOrderStatus: updateStatusMutation.mutate,
    updateOrderStatusAsync: updateStatusMutation.mutateAsync,
  };
}
