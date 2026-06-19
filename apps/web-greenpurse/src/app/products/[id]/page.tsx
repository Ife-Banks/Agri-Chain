'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useCartStore } from '../../../store/cart';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../../lib/mock-data';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const product = MOCK_PRODUCTS.find((item) => item.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  if (!product) return notFound();

  const category = MOCK_CATEGORIES.find((item) => item.id === product.categoryId);
  const images = product.images?.length
    ? product.images.map((img: any) => img.url)
    : [`https://picsum.photos/seed/${product.id}/900/900`];

  const handleAddToCart = () => {
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
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Link href="/" className="transition hover:text-[var(--color-green-600)]">Home</Link>
        <span>/</span>
        <Link href="/products" className="transition hover:text-[var(--color-green-600)]">Products</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${category.slug}`} className="transition hover:text-[var(--color-green-600)]">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate text-[var(--color-text-primary)]">{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-4 md:p-5">
          <div className="overflow-hidden rounded-[1.5rem] bg-[var(--color-bg-subtle)]">
            <img
              src={images[selectedImage]}
              alt={product.title}
              className="aspect-square w-full object-cover"
              onError={(event) => {
                (event.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/900/900`;
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={url}
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    index === selectedImage ? 'border-[var(--color-green-600)]' : 'border-transparent hover:border-[var(--color-border-default)]'
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card className="p-6 md:p-8">
            <Badge>{product.condition}</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--color-text-primary)] md:text-4xl">
              {product.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="text-4xl font-black text-[var(--color-text-primary)]">
                NGN {Number(product.price).toLocaleString()}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">per {product.kilogram}kg</div>
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)] md:text-base">
              {product.description}
            </p>

            <Separator className="my-6" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex items-center rounded-full border border-[var(--color-border-default)] bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition hover:bg-[var(--color-bg-subtle)]"
                >
                  −
                </button>
                <span className="min-w-12 text-center text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition hover:bg-[var(--color-bg-subtle)]"
                >
                  +
                </button>
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 rounded-full"
              >
                {added ? 'Added to cart' : 'Add to cart'}
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cart">View cart</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-lg font-bold text-[var(--color-text-primary)]">Why choose GreenPurse?</div>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div>• Free delivery on orders above NGN 5,000</div>
              <div>• Quality verified before dispatch</div>
              <div>• Simple returns and support</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
