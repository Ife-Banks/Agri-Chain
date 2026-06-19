import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

type DriverStatus = 'available' | 'in_transit' | 'offline';
type VehicleStatus = 'active' | 'maintenance' | 'inactive';
type BatchStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
  totalDeliveries: number;
  rating: number;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: string;
  status: VehicleStatus;
  driver: string;
}

interface DeliveryBatch {
  id: string;
  orderId: string;
  driver: string;
  vehicle: string;
  status: BatchStatus;
  startedAt: string;
  deliveredAt?: string;
  recipient: string;
  address: string;
}

function toDriver(res: any): Driver {
  return {
    id: res.id,
    name: res.name,
    phone: res.phone,
    vehicle: res.vehicle?.plateNumber ? `${res.vehicle.type} - ${res.vehicle.plateNumber}` : res.vehicle || '',
    status: res.status || 'offline',
    totalDeliveries: res.totalDeliveries || res.total_deliveries || 0,
    rating: res.rating || 0,
  };
}

function toVehicle(res: any): Vehicle {
  return {
    id: res.id,
    plateNumber: res.plateNumber || res.plate_number || '',
    type: res.type || '',
    capacity: res.capacity || '',
    status: res.status || 'inactive',
    driver: res.driver?.name || res.driver || '',
  };
}

function toBatch(res: any): DeliveryBatch {
  return {
    id: res.id,
    orderId: res.orderId || res.order_id || '',
    driver: res.driver?.name || res.driver || '',
    vehicle: res.vehicle?.plateNumber || res.vehicle || '',
    status: res.status || 'pending',
    startedAt: res.startedAt || res.started_at || '',
    deliveredAt: res.deliveredAt || res.delivered_at,
    recipient: res.recipient || '',
    address: res.address || '',
  };
}

export function useDrivers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers', params],
    queryFn: async () => {
      const response = await api.get('/logistics/drivers', { params });
      const result = response.data;
      return {
        drivers: (result.data || []).map(toDriver),
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 1,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/logistics/drivers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/logistics/drivers/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/logistics/drivers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  });

  return {
    drivers: data?.drivers || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    createDriver: createMutation.mutate,
    updateDriver: updateMutation.mutate,
    deleteDriver: deleteMutation.mutate,
    createDriverAsync: createMutation.mutateAsync,
    updateDriverAsync: updateMutation.mutateAsync,
    deleteDriverAsync: deleteMutation.mutateAsync,
  };
}

export function useVehicles(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles', params],
    queryFn: async () => {
      const response = await api.get('/logistics/vehicles', { params });
      const result = response.data;
      return {
        vehicles: (result.data || []).map(toVehicle),
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 1,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/logistics/vehicles', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/logistics/vehicles/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/logistics/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  return {
    vehicles: data?.vehicles || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    createVehicle: createMutation.mutate,
    updateVehicle: updateMutation.mutate,
    deleteVehicle: deleteMutation.mutate,
    createVehicleAsync: createMutation.mutateAsync,
    updateVehicleAsync: updateMutation.mutateAsync,
    deleteVehicleAsync: deleteMutation.mutateAsync,
  };
}

export function useBatches(params?: { page?: number; limit?: number; status?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['batches', params],
    queryFn: async () => {
      const response = await api.get('/logistics/batches', { params });
      const result = response.data;
      return {
        batches: (result.data || []).map(toBatch),
        total: result.total || 0,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || 1,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/logistics/batches', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batches'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/logistics/batches/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['batches'] }),
  });

  return {
    batches: data?.batches || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    createBatch: createMutation.mutate,
    updateBatch: updateMutation.mutate,
    createBatchAsync: createMutation.mutateAsync,
    updateBatchAsync: updateMutation.mutateAsync,
  };
}