import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../lib/api';
import { useAdminStore } from '../store/adminStore';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator' | 'Farmer';
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  lastLogin: string;
}

function toUser(res: any): User {
  return {
    id: res.id,
    name: res.username || res.email,
    email: res.email,
    role: res.isAdmin ? 'Admin' : res.isFarmer ? 'Farmer' : res.isAgricEnterprise ? 'Moderator' : 'User',
    status: 'Active',
    createdAt: res.createdAt ? new Date(res.createdAt).toISOString().slice(0, 10) : '',
    lastLogin: res.lastLogin || 'Never',
  };
}

export function useUsers(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { setUsers, addUser, updateUser, deleteUser } = useAdminStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      try {
        const response = await usersApi.getAll(params);
        const result = response.data;
        const users = (result.data || []).map(toUser);
        setUsers(users);
        return { ...result, data: users };
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return { data: [], total: 0, page: 1, limit: 20 };
      }
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (formData: any) => {
      return usersApi.create({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        isAdmin: formData.isAdmin === true || formData.isAdmin === 'true',
        isFarmer: formData.isFarmer === true || formData.isFarmer === 'true',
        isAgricEnterprise: formData.isAgricEnterprise === true || formData.isAgricEnterprise === 'true',
      });
    },
    onSuccess: (response) => {
      addUser(toUser(response.data));
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data: formData }: { id: string; data: any }) => {
      const payload: any = {};
      if (formData.username !== undefined) payload.username = formData.username;
      if (formData.phone !== undefined) payload.phoneNumber = formData.phone;
      if (formData.isAdmin !== undefined) payload.isAdmin = formData.isAdmin;
      if (formData.isFarmer !== undefined) payload.isFarmer = formData.isFarmer;
      if (formData.isAgricEnterprise !== undefined) payload.isAgricEnterprise = formData.isAgricEnterprise;
      return usersApi.update(id, payload);
    },
    onSuccess: (response, variables) => {
      updateUser(variables.id, toUser(response.data));
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: (_, variables) => {
      deleteUser(variables);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    isLoading,
    error,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    updateUserAsync: updateUserMutation.mutateAsync,
    deleteUserAsync: deleteUserMutation.mutateAsync,
  };
}
