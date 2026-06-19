import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../lib/api';
import { useAdminStore } from '../store/adminStore';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive' | 'Out of Stock';
}

function toProduct(res: any): Product {
  return {
    id: res.id,
    name: res.title || res.name,
    category: res.category?.name || res.category || 'Unknown',
    price: Number(res.price) || 0,
    stock: Number(res.stock) || 0,
    status: res.isActive === false ? 'Inactive' : res.stock === 0 ? 'Out of Stock' : 'Active',
  };
}

export function useProducts(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { setProducts, addProduct, updateProduct, deleteProduct } = useAdminStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const response = await productsApi.getAll(params);
        const result = response.data;
        const products = (result.data || []).map(toProduct);
        setProducts(products);
        return { ...result, data: products };
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return { data: [], total: 0, page: 1, limit: 20 };
      }
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (formData: any) => {
      const payload = {
        title: formData.title || formData.name,
        description: formData.description || `${formData.title || formData.name} - Quality product`,
        categoryId: formData.categoryId || '00000000-0000-0000-0000-000000000000',
        price: Number(formData.price) || 0,
        kilogram: Number(formData.kilogram) || 1,
        stock: Number(formData.stock) || 0,
        condition: (formData.condition || 'Fresh') as any,
      };
      return productsApi.create(payload);
    },
    onSuccess: (response) => {
      addProduct(toProduct(response.data));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data: formData }: { id: string; data: any }) => {
      const payload = {
        title: formData.title || formData.name,
        description: formData.description || '',
        price: Number(formData.price) || 0,
        kilogram: Number(formData.kilogram) || 1,
        stock: Number(formData.stock) || 0,
        condition: formData.condition || 'Fresh',
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };
      return productsApi.update(id, payload);
    },
    onSuccess: (response, variables) => {
      updateProduct(variables.id, toProduct(response.data));
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: (_, variables) => {
      deleteProduct(variables);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    isLoading,
    error,
    createProduct: createProductMutation.mutate,
    updateProduct: updateProductMutation.mutate,
    deleteProduct: deleteProductMutation.mutate,
    createProductAsync: createProductMutation.mutateAsync,
    updateProductAsync: updateProductMutation.mutateAsync,
    deleteProductAsync: deleteProductMutation.mutateAsync,
  };
}
