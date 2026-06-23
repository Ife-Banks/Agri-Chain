'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  X,
  Save,
  Image,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Pagination } from '../../components/ui/pagination';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl: string;
  productCount: number;
  isActive: boolean;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Vegetables', slug: 'vegetables', iconUrl: '', productCount: 124, isActive: true },
  { id: '2', name: 'Fruits', slug: 'fruits', iconUrl: '', productCount: 89, isActive: true },
  { id: '3', name: 'Grains', slug: 'grains', iconUrl: '', productCount: 56, isActive: true },
  { id: '4', name: 'Tubers', slug: 'tubers', iconUrl: '', productCount: 45, isActive: true },
  { id: '5', name: 'Spices', slug: 'spices', iconUrl: '', productCount: 32, isActive: true },
  { id: '6', name: 'Legumes', slug: 'legumes', iconUrl: '', productCount: 28, isActive: true },
  { id: '7', name: 'Dairy', slug: 'dairy', iconUrl: '', productCount: 15, isActive: false },
  { id: '8', name: 'Poultry', slug: 'poultry', iconUrl: '', productCount: 12, isActive: true },
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState(mockCategories);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', iconUrl: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [useApi, setUseApi] = useState(false);

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['categories', page, pageSize, search],
    queryFn: async () => {
      const response = await api.get('/categories', {
        params: { page, limit: pageSize, search },
      });
      return response.data;
    },
    enabled: useApi,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setForm({ name: '', slug: '', iconUrl: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', slug: '', iconUrl: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => api.post(`/categories/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  useEffect(() => {
    if (useApi && apiData?.data) {
      setCategories(apiData.data);
    } else if (!useApi) {
      setCategories(mockCategories);
    }
  }, [apiData, useApi]);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = apiData?.total || filteredCategories.length;
  const totalPages = apiData?.totalPages || Math.ceil(filteredCategories.length / pageSize);

  const handleSave = () => {
    if (useApi) {
      if (editingCategory) {
        updateMutation.mutate({ id: editingCategory.id, data: form });
      } else {
        createMutation.mutate(form);
      }
    } else {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...form } : c))
        );
      } else {
        setCategories((prev) => [
          ...prev,
          { id: Date.now().toString(), ...form, productCount: 0, isActive: true },
        ]);
      }
      setShowModal(false);
      setEditingCategory(null);
      setForm({ name: '', slug: '', iconUrl: '' });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, slug: category.slug, iconUrl: category.iconUrl });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      if (useApi) {
        deleteMutation.mutate(id);
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const toggleActive = (id: string) => {
    if (useApi) {
      toggleStatusMutation.mutate(id);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      );
    }
  };

  const openNewModal = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', iconUrl: '' });
    setShowModal(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
          <a href="/" className="hover:text-emerald-400">Dashboard</a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-50">Categories</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Categories</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage product categories</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseApi(!useApi)}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                useApi
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              {useApi ? 'Using API' : 'Using Mock Data'}
            </button>
            <Button onClick={openNewModal} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="pl-10 border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              {useApi && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              )}
            </div>
          </div>

          {isLoading && useApi ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-50">{category.name}</p>
                      <p className="text-xs text-zinc-400">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={category.isActive ? 'success' : 'secondary'} className="bg-emerald-500/10 text-emerald-300">
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-zinc-400">{category.productCount} products</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(category.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          category.isActive
                            ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {category.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Category Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., Vegetables"
                  className="border-white/10 bg-white/5 text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="vegetables"
                  className="border-white/10 bg-white/5 text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Icon URL (optional)</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={form.iconUrl}
                    onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                    placeholder="https://..."
                    className="pl-10 border-white/10 bg-white/5 text-zinc-100"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="border-white/10 text-zinc-50 hover:bg-white/5">
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400" disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}