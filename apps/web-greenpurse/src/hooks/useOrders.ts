import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../lib/api';

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
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  address: string;
  phone: string;
  createdAt: string;
}

function toOrder(res: any): Order {
  return {
    id: res.id,
    customer: res.user?.username || res.customer || 'Unknown',
    customerAvatar: res.user?.avatarUrl || res.customerAvatar,
    items: res.items || [],
    subtotal: Number(res.subtotal) || 0,
    deliveryFee: Number(res.deliveryFee) || 0,
    total: Number(res.grandTotal) || 0,
    status: res.status || 'pending',
    address: res.deliveryAddressId || res.address || '',
    phone: res.user?.phoneNumber || res.phone || '',
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
    queryFn: async () => {
      const response = await orderApi.getOrders({ limit: 100 });
      const orders = (response.data || []).map(toOrder);
      return {
        total: response.total,
        pending: orders.filter((o: Order) => o.status === 'pending').length,
        processing: orders.filter((o: Order) => o.status === 'processing').length,
        shipped: orders.filter((o: Order) => o.status === 'shipped' || o.status === 'in_transit').length,
        delivered: orders.filter((o: Order) => o.status === 'delivered').length,
        cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
      };
    },
  });

  return {
    stats: data,
    isLoading,
    error,
  };
}