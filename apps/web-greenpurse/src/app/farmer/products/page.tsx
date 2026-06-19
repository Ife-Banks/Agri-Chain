'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Pagination } from '../../../components/ui/pagination';
import { Loader2 } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

const mockProducts = [
  {
    id: 'p1',
    title: 'Fresh Organic Tomatoes',
    description: 'Locally grown organic tomatoes, harvested fresh from the farm.',
    price: 4500,
    stock: 8,
    condition: 'Fresh',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
    category: 'Vegetables',
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'p2',
    title: 'Yellow Maize',
    description: 'High-quality yellow maize, suitable for food, animal feed, or processing.',
    price: 2800,
    stock: 15,
    condition: 'Dried',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop',
    category: 'Grains',
    createdAt: '2026-06-08T14:30:00Z',
  },
  {
    id: 'p3',
    title: 'Fresh Cassava Tubers',
    description: 'Freshly harvested cassava tubers, rich in carbohydrates.',
    price: 1800,
    stock: 45,
    condition: 'Fresh',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=400&fit=crop',
    category: 'Tubers',
    createdAt: '2026-06-05T09:15:00Z',
  },
  {
    id: 'p4',
    title: 'Dry Groundnut',
    description: 'Clean, dry groundnuts. Great for oil extraction, roasting, or direct consumption.',
    price: 6500,
    stock: 32,
    condition: 'Dried',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1596395819057-3a8b8c7a3f5e?w=400&h=400&fit=crop',
    category: 'Legumes',
    createdAt: '2026-06-01T11:45:00Z',
  },
  {
    id: 'p5',
    title: 'Organic Spinach Bundle',
    description: 'Fresh organic spinach leaves, hand-picked for maximum freshness.',
    price: 2200,
    stock: 5,
    condition: 'Fresh',
    isActive: false,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    category: 'Vegetables',
    createdAt: '2026-05-28T16:00:00Z',
  },
  {
    id: 'p6',
    title: 'Premium Palm Oil',
    description: 'Freshly processed palm oil, extracted from sustainable farms.',
    price: 5500,
    stock: 28,
    condition: 'Processed',
    isActive: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
    category: 'Processed',
    createdAt: '2026-05-20T13:20:00Z',
  },
];

const statusColors: Record<string, string> = {
  Fresh: 'bg-green-100 text-green-700 border-green-200',
  Dried: 'bg-amber-100 text-amber-700 border-amber-200',
  Processed: 'bg-blue-100 text-blue-700 border-blue-200',
};

interface ProductRowProps {
  product: typeof mockProducts[0];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ProductRow({ product, onToggle, onDelete }: ProductRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isLowStock = product.stock < 10;

  return (
    <>
      <tr className="group border-b border-[rgba(203,213,224,0.3)] transition-colors hover:bg-green-50/50">
        <td className="py-4 pl-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[rgba(203,213,224,0.4)] bg-gray-100">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {!product.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{product.title}</p>
              <p className="mt-1 line-clamp-1 text-sm text-gray-500">{product.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={`text-[10px] ${statusColors[product.condition]}`}>
                  {product.condition}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <div>
            <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
              {product.stock}
            </p>
            <p className="text-xs text-gray-500">units</p>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          <p className="text-lg font-bold text-green-700">{formatCurrency(product.price)}</p>
          <p className="text-xs text-gray-500">per unit</p>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/farmer/products/${product.id}/edit`}
              className="rounded-xl border border-[rgba(203,213,224,0.6)] bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-700"
            >
              Edit
            </Link>
            <button
              onClick={() => onToggle(product.id)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                product.isActive
                  ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {product.isActive ? 'Deactivate' : 'Activate'}
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-100"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDelete(product.id)}
                  className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-red-600"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

export default function FarmerProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(mockProducts.length);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [page, pageSize, search, filterStatus, sortBy]);

  const filteredProducts = products
    .filter((p) => {
      if (filterStatus === 'active') return p.isActive;
      if (filterStatus === 'inactive') return !p.isActive;
      return true;
    })
    .filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const handleToggle = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  };

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge className="bg-green-100 text-green-700 border-green-200">My Products</Badge>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
              Product Management
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your farm produce inventory and listings
            </p>
          </div>
          <Button asChild className="rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg hover:from-green-700 hover:to-green-800">
            <Link href="/farmer/products/new">
              <span className="mr-2 text-lg">+</span> Add New Product
            </Link>
          </Button>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-[rgba(203,213,224,0.6)] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="mt-1 text-2xl font-bold text-green-700">{activeCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-xl">✓</div>
            </div>
          </Card>
          <Card className="border-[rgba(203,213,224,0.6)] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Products</p>
                <p className="mt-1 text-2xl font-bold text-amber-700">{inactiveCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl">⏸</div>
            </div>
          </Card>
          <Card className="border-[rgba(203,213,224,0.6)] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="mt-1 text-2xl font-bold text-red-600">{lowStockCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl">⚠</div>
            </div>
          </Card>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[rgba(203,213,224,0.4)] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search products..."
                  className="w-full rounded-xl border border-[rgba(203,213,224,0.6)] bg-white/80 py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-green-400 focus:bg-white focus:shadow-[0_8px_24px_rgba(15,74,40,0.12)]"
                />
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }}
                  className="rounded-xl border border-[rgba(203,213,224,0.6)] bg-white px-3 py-2.5 text-sm shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-xl border border-[rgba(203,213,224,0.6)] bg-white px-3 py-2.5 text-sm shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">📦</div>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {search ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/farmer/products/new">Add Product</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(203,213,224,0.4)] bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Product</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(203,213,224,0.3)]">
                    {filteredProducts.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[rgba(203,213,224,0.4)] p-4">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / pageSize)}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              </div>
            </>
          )}
        </Card>
      </motion.section>
    </motion.div>
  );
}