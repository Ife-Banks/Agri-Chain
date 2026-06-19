'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '../../components/product/ProductCard';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { useCartStore } from '../../store/cart';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../lib/mock-data';
import type { Product } from '@aisuce/types';

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  const categoryQuery = searchParams?.get('category') || '';

  const [search, setSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');

  const addItem = useCartStore((s) => s.addItem);

  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      products = products.filter((product) =>
        product.title.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      products = products.filter((product) =>
        MOCK_CATEGORIES.find((cat) => cat.slug === selectedCategory && cat.id === product.categoryId)
      );
    }

    products = products.filter((product) => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (sortBy === 'price-asc') products.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'price-desc') products.sort((a, b) => Number(b.price) - Number(a.price));
    else products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return products;
  }, [search, selectedCategory, priceRange, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      product: {
        id: product.id,
        title: product.title,
        price: Number(product.price),
        kilogram: Number(product.kilogram),
        images: product.images || [],
        condition: product.condition,
      },
      quantity: 1,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPriceRange([0, 10000]);
    setSortBy('newest');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 rounded-[2rem] bg-[linear-gradient(135deg,rgba(15,74,40,0.98),rgba(26,107,58,0.92),rgba(45,138,80,0.9))] px-6 py-8 text-white md:px-8">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Catalog</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Browse premium farm produce</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80 md:text-base">
          A refined shopping page with better hierarchy, richer filters, and cleaner spacing.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="h-fit p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">Filters</div>
              <h2 className="mt-2 text-lg font-bold text-[var(--color-text-primary)]">Refine results</h2>
            </div>
            <Badge variant="secondary">{filtered.length}</Badge>
          </div>

          <Separator className="my-5" />

          <div className="space-y-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tomatoes, yams, rice..."
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="ui-input"
              >
                <option value="">All categories</option>
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
                Price range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ui-input">
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            {(search || selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Button variant="outline" className="w-full rounded-full" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">Results</div>
              <h2 className="mt-2 text-2xl font-extrabold text-[var(--color-text-primary)]">
                {filtered.length} product{filtered.length === 1 ? '' : 's'} available
              </h2>
            </div>
            <div className="text-sm text-[var(--color-text-secondary)]">
              Tip: use search and filters to narrow the catalog faster
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-5xl">🔎</div>
              <h3 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">No products found</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Try a wider search or clear the filters.</p>
              <Button className="mt-6 rounded-full" onClick={clearFilters}>Reset filters</Button>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-[var(--color-text-secondary)]">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
