'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Separator } from '../../../../components/ui/separator';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const categories = [
  { id: '1', name: 'Vegetables', slug: 'vegetables' },
  { id: '2', name: 'Fruits', slug: 'fruits' },
  { id: '3', name: 'Grains', slug: 'grains' },
  { id: '4', name: 'Tubers', slug: 'tubers' },
  { id: '5', name: 'Spices', slug: 'spices' },
  { id: '6', name: 'Legumes', slug: 'legumes' },
];

const conditions = [
  { value: 'Fresh', label: 'Fresh', description: 'Recently harvested, perishable' },
  { value: 'Dried', label: 'Dried', description: 'Dehydrated for longer storage' },
  { value: 'Processed', label: 'Processed', description: 'Packaged or transformed product' },
];

const mockProduct = {
  id: 'p1',
  title: 'Fresh Organic Tomatoes',
  description: 'Locally grown organic tomatoes, harvested fresh from the farm. Perfect for salads, cooking, or juicing. Grown using sustainable farming practices.',
  categoryId: '1',
  price: 4500,
  stock: 8,
  condition: 'Fresh',
  imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
  isActive: true,
};

interface FormData {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  stock: string;
  condition: string;
  imageUrl: string;
  isActive: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  price?: string;
  stock?: string;
  condition?: string;
  imageUrl?: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    categoryId: '',
    price: '',
    stock: '',
    condition: '',
    imageUrl: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setForm({
        title: mockProduct.title,
        description: mockProduct.description,
        categoryId: mockProduct.categoryId,
        price: mockProduct.price.toString(),
        stock: mockProduct.stock.toString(),
        condition: mockProduct.condition,
        imageUrl: mockProduct.imageUrl,
        isActive: mockProduct.isActive,
      });
      setImagePreview(mockProduct.imageUrl);
      setLoadingProduct(false);
    }, 500);
  }, [productId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (form.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!form.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!form.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!form.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }

    if (!form.condition) {
      newErrors.condition = 'Please select a condition';
    }

    if (form.imageUrl && !isValidUrl(form.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid image URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUrlChange = (url: string) => {
    setForm({ ...form, imageUrl: url });
    if (isValidUrl(url)) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    alert('Product updated successfully!');
    router.push('/farmer/products');
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm({ ...form, [field]: value });
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <Link href="/farmer/products" className="hover:text-green-700">Products</Link>
            <span>/</span>
            <span className="truncate max-w-[200px]">{form.title || 'Edit Product'}</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
            Edit Product
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Update your product information
          </p>
        </div>
      </motion.section>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <motion.div variants={item} className="space-y-6">
            <Card className="border-[rgba(203,213,224,0.6)] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Basic Information</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Provide accurate details to help buyers find your product
              </p>
              <div className="mt-6 space-y-4">
                <Input
                  label="Product Title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Fresh Organic Tomatoes"
                  error={errors.title}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe your product in detail - origin, quality, uses, etc."
                    rows={4}
                    className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.description
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-[rgba(203,213,224,0.6)] bg-white focus:border-green-400'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                      Category
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => updateField('categoryId', e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                        errors.categoryId
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-[rgba(203,213,224,0.6)] bg-white focus:border-green-400'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                      Condition
                    </label>
                    <select
                      value={form.condition}
                      onChange={(e) => updateField('condition', e.target.value)}
                      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                        errors.condition
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-[rgba(203,213,224,0.6)] bg-white focus:border-green-400'
                      }`}
                    >
                      <option value="">Select condition</option>
                      {conditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                    {errors.condition && (
                      <p className="mt-1 text-xs text-red-600">{errors.condition}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-[rgba(203,213,224,0.6)] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Pricing & Inventory</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Set your price and available stock
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    Price (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-secondary)]">₦</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full rounded-xl border py-3 pl-8 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                        errors.price
                          ? 'border-red-300 bg-red-50 focus:border-red-400'
                          : 'border-[rgba(203,213,224,0.6)] bg-white focus:border-green-400'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => updateField('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                    className={`w-full rounded-xl border py-3 px-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                      errors.stock
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : 'border-[rgba(203,213,224,0.6)] bg-white focus:border-green-400'
                    }`}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-[rgba(203,213,224,0.6)] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Product Image</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Add a URL to your product image
              </p>
              <div className="mt-6 space-y-4">
                <Input
                  label="Image URL"
                  value={form.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  error={errors.imageUrl}
                />
                {imagePreview && (
                  <div className="relative overflow-hidden rounded-xl border border-[rgba(203,213,224,0.4)]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item} className="space-y-6">
            <Card className="border-[rgba(203,213,224,0.6)] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sticky top-24">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Product Status</h2>
              <div className="mt-4">
                <label className="flex items-center gap-3 rounded-xl border border-[rgba(203,213,224,0.6)] bg-gray-50/50 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateField('isActive', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {form.isActive ? 'Product is active' : 'Product is inactive'}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {form.isActive
                        ? 'Buyers can see and purchase this product'
                        : 'Product is hidden from buyers'}
                    </p>
                  </div>
                </label>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <Button type="submit" className="w-full rounded-xl" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" className="w-full rounded-xl" asChild>
                  <Link href="/farmer/products">Cancel</Link>
                </Button>
              </div>
              <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">
                Changes will be saved immediately
              </p>
            </Card>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}