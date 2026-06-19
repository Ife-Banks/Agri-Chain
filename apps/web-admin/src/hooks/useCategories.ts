import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../lib/api';

export function useCategories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  return {
    categories: data?.data || [],
    isLoading,
    error,
  };
}