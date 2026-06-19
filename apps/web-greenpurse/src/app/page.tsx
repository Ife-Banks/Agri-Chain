'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '../components/product/ProductCard';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCartStore } from '../store/cart';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/mock-data';
import type { Product } from '@aisuce/types';

const CATEGORY_META: Record<string, { image: string; gradient: string }> = {
  vegetables: { image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)' },
  fruits: { image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #fff7ed 0%, #fde68a 100%)' },
  grains: { image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)' },
  tubers: { image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)' },
  spices: { image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' },
  legumes: { image: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?w=400&h=400&fit=crop', gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
};

function useInView() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 550ms ease ${delay}s, transform 550ms ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="group rounded-3xl border border-[rgba(203,213,224,0.75)] bg-white/85 p-5 text-center shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,74,40,0.12)] hover:-translate-y-1 hover:border-green-300">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:from-green-100 group-hover:to-emerald-200">
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-[var(--color-green-800)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{label}</div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">{eyebrow}</div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] md:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = React.useState({ hours: 23, minutes: 59, seconds: 59 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-6 flex items-center gap-2 rounded-xl bg-[rgba(239,68,68,0.08)] px-4 py-3">
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-red-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Offer ends in:
      </div>
      <div className="flex gap-2">
        {[
          { value: timeLeft.hours, label: 'h' },
          { value: timeLeft.minutes, label: 'm' },
          { value: timeLeft.seconds, label: 's' },
        ].map((item) => (
          <div key={item.label} className="flex items-center">
            <div className="min-w-[28px] rounded-lg bg-red-500 px-2 py-1 text-center text-sm font-bold text-white">
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="ml-1 text-xs font-medium text-red-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockIndicator() {
  const stockPercent = 35;
  return (
    <div className="mt-4 rounded-xl bg-[rgba(239,68,68,0.05)] p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-red-600">Only {stockPercent}% left in stock</span>
        <span className="text-[var(--color-text-secondary)]">Selling fast!</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-red-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
          style={{ width: `${stockPercent}%` }}
        />
      </div>
    </div>
  );
}

function DealCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden border-[rgba(143,207,160,0.45)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,252,249,0.98))] shadow-[0_20px_60px_rgba(15,74,40,0.12)] transition-shadow duration-300 hover:shadow-[0_30px_80px_rgba(15,74,40,0.18)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-[rgba(26,107,58,0.08)] text-[var(--color-green-700)]">Limited Offer</Badge>
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">-23% OFF</Badge>
          </div>
          <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">Today&apos;s Farm Deal</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
            {product.title} - {product.description}
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-3 sm:mt-6">
            <div className="text-3xl font-black text-[var(--color-text-primary)] sm:text-4xl">NGN {Number(product.price).toLocaleString()}</div>
            <div className="text-sm text-[var(--color-text-secondary)] line-through sm:text-base">NGN {Math.round(Number(product.price) * 1.3).toLocaleString()}</div>
          </div>
          <CountdownTimer />
          <StockIndicator />
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <Button asChild className="rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Link href={`/products/${product.id}`}>Grab This Deal</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-2 transition-all duration-300 hover:bg-[var(--color-green-50)]">
              <Link href="/products">Browse All</Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
            {[
              { icon: '🌱', text: 'Freshly picked' },
              { icon: '✓', text: 'Verified quality' },
              { icon: '🚀', text: 'Fast dispatch' },
            ].map((item) => (
              <div key={item.text} className="group flex items-center gap-2 rounded-2xl border border-[var(--color-border-default)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-primary)] shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:border-green-300 hover:shadow-[0_12px_28px_rgba(15,74,40,0.12)] sm:px-4 sm:py-3">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-full">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,74,40,0.05),rgba(15,74,40,0.18))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 px-4 py-2 text-center shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-green-700)]">Premium Quality</div>
            <div className="text-sm font-bold text-[var(--color-text-primary)]">Farm to Table</div>
          </div>
          <img
            src={product.images?.[0]?.url || ''}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const addItem = useCartStore((s) => s.addItem);
  const featuredProducts = MOCK_PRODUCTS.slice(0, 6);
  const dealProduct = MOCK_PRODUCTS[3];

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

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      <section className="ui-surface relative overflow-hidden rounded-[2rem] px-6 py-10 text-[var(--color-text-primary)] md:px-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,107,58,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(45,138,80,0.08),transparent_26%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge className="bg-[rgba(26,107,58,0.08)] text-[var(--color-green-700)]">🌾 Nigeria&apos;s trusted produce market</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
              Fresh produce, delivered with a premium feel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] md:text-lg">
              GreenPurse connects households and businesses to verified farmers with a fast, elegant buying experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <Link href="/products">Shop now</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-2 transition-all duration-300 hover:bg-[var(--color-green-50)]">
                <Link href="/register">Join as farmer</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verified farmers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Same-day dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="group overflow-hidden bg-white text-[var(--color-text-primary)] backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,74,40,0.15)] hover:-translate-y-1">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop" alt="Fresh Organic Tomatoes" className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold">Fresh Organic Tomatoes</div>
                <div className="mt-1 text-lg font-bold text-[var(--color-green-700)]">NGN 2,500</div>
              </div>
            </Card>
            <Card className="mt-10 group overflow-hidden bg-white text-[var(--color-text-primary)] backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,74,40,0.15)] hover:-translate-y-1">
              <div className="relative">
                <img src="https://plus.unsplash.com/premium_photo-1668420870736-168a5a5c79a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJ5JTIwZ3JvdW5kbnV0fGVufDB8fDB8fHww" alt="Dry Groundnut" className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold">Dry Groundnut</div>
                <div className="mt-1 text-lg font-bold text-[var(--color-green-700)]">NGN 1,800</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <AnimatedSection>
        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat 
            value="12k+" 
            label="Active buyers" 
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <Stat 
            value="3.5k+" 
            label="Verified farmers" 
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <Stat 
            value="98%" 
            label="Satisfaction rate" 
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <Stat 
            value="36" 
            label="States covered" 
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          />
        </section>
      </AnimatedSection>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          description="A cleaner way to explore produce, with more breathing room and clearer visual grouping."
          action={(
            <Button asChild variant="ghost" className="rounded-full px-4 text-[var(--color-green-600)]">
              <Link href="/products">View all</Link>
            </Button>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {MOCK_CATEGORIES.map((cat, index) => {
            const meta = CATEGORY_META[cat.slug] || CATEGORY_META.vegetables;
            return (
              <AnimatedSection key={cat.id} delay={index * 0.05}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-[rgba(203,213,224,0.8)] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(15,74,40,0.15)] hover:border-green-300"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={meta.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-300 group-hover:text-[var(--color-green-600)]">{cat.name}</div>
                    <div className="mt-1 text-xs text-[var(--color-text-secondary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Explore →
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Curated Selection"
          title="Featured products"
          description="A more premium product grid with consistent card spacing and stronger product hierarchy."
          action={(
            <Button asChild variant="ghost" className="rounded-full px-4 text-[var(--color-green-600)]">
              <Link href="/products">Shop all</Link>
            </Button>
          )}
        />
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <AnimatedSection key={product.id}>
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <DealCard product={dealProduct} />
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="How it works"
          title="Simple steps to fresh produce"
          description="From browsing to delivery, we make it effortless to get quality farm produce."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { 
              title: 'Browse', 
              desc: 'Search and filter produce quickly.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            },
            { 
              title: 'Order', 
              desc: 'Checkout is direct and intuitive.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
            { 
              title: 'Receive', 
              desc: 'Delivery status is easy to follow.',
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              )
            },
          ].map((step, index) => (
            <AnimatedSection key={step.title} delay={index * 0.1}>
              <Card hover className="group relative overflow-hidden p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(15,74,40,0.15)] hover:-translate-y-1">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 opacity-50 transition-all duration-300 group-hover:scale-150 group-hover:from-green-200 group-hover:to-emerald-200" />
                <div className="relative">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:from-green-100 group-hover:to-emerald-200">
                    {step.icon}
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">Step</div>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-[var(--color-text-primary)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">{step.desc}</p>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <AnimatedSection>
        <section className="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 px-6 py-12 text-center text-white shadow-[0_20px_60px_rgba(15,74,40,0.25)] md:px-12 md:py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Ready to get fresh produce?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-green-100 md:text-lg">
                Join thousands of happy customers who trust GreenPurse for their farm-fresh produce needs.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full bg-white text-green-700 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <Link href="/products">Start shopping</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20">
                  <Link href="/register">Become a farmer</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-green-100">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Free delivery on orders over ₦10,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100% money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
