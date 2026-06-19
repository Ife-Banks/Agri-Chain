'use client';

import React from 'react';
import Link from 'next/link';
import type { Product } from '@aisuce/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || `https://picsum.photos/seed/${product.id}/400/400`;
  const [isWishlisted, setIsWishlisted] = React.useState(false);

  return (
    <Card hover className="group overflow-hidden p-0 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,74,40,0.15)] hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-subtle)]">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            onError={(event) => {
              (event.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/400/400`;
            }}
          />
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:scale-110"
          >
            <svg
              className={`h-5 w-5 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Condition Badge */}
          <div className="absolute left-3 top-3">
            <Badge className="bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--color-green-700)] shadow-lg backdrop-blur-sm">
              {product.condition}
            </Badge>
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.75))] p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-3">
              <Badge className="bg-white/20 text-white border-white/30" variant="default">
                View Details
              </Badge>
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[var(--color-green-700] shadow-lg backdrop-blur-sm">
                Quick view
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.id}`} className="group/title flex-1">
            <h3
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
              className="text-base font-semibold leading-6 text-[var(--color-text-primary)] transition-colors group-hover/title:text-[var(--color-green-600)] sm:text-[0.98rem]"
            >
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-[var(--color-text-primary)] sm:text-xl">
              NGN {Number(product.price).toLocaleString()}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">per {product.kilogram}kg</div>
          </div>
          <div className="rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 text-xs font-semibold text-[var(--color-green-700)] border border-green-200 shadow-sm">
            Fresh
          </div>
        </div>

        <Button
          onClick={() => onAddToCart?.(product)}
          className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-green-700 shadow-md transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-[1.02]"
          size="sm"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
