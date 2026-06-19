import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStores } from '../lib/api';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  farmerId: string;
  createdAt: string;
}

function toStore(res: any): Store {
  return {
    id: res.id,
    name: res.name,
    slug: res.slug,
    description: res.description,
    address: res.address,
    phoneNumber: res.phoneNumber,
    email: res.email,
    isVerified: res.isVerified,
    isActive: res.isActive,
    farmerId: res.farmerId,
    createdAt: res.createdAt ? new Date(res.createdAt).toISOString().slice(0, 10) : '',
  };
}

export function useStores(params?: { page?: number; limit?: number; search?: string; isVerified?: boolean }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['stores', params],
    queryFn: async () => {
      const response = await adminStores.getAll(params);
      const result = response.data;
      const stores = (result.data || []).map(toStore);
      return { ...result, data: stores };
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminStores.verify(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminStores.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stores'] }),
  });

  return {
    stores: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    isLoading,
    error,
    verifyStore: verifyMutation.mutate,
    deactivateStore: deactivateMutation.mutate,
    verifyStoreAsync: verifyMutation.mutateAsync,
    deactivateStoreAsync: deactivateMutation.mutateAsync,
  };
}