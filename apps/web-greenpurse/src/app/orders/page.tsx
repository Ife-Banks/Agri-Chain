'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

const MOCK_ORDERS = [
  {
    id: 'ord-001',
    createdAt: '2026-06-10',
    status: 'DELIVERED',
    grandTotal: 12500,
    items: [
      { title: 'Fresh Organic Tomatoes', quantity: 2, unitPrice: 4500 },
      { title: 'Yellow Maize', quantity: 1, unitPrice: 2800 },
    ],
  },
  {
    id: 'ord-002',
    createdAt: '2026-06-14',
    status: 'ON_THE_WAY',
    grandTotal: 8200,
    items: [{ title: 'Fresh Cassava Tubers', quantity: 3, unitPrice: 2740 }],
  },
  {
    id: 'ord-003',
    createdAt: '2026-06-16',
    status: 'PLACED',
    grandTotal: 5500,
    items: [{ title: 'Premium Palm Oil', quantity: 1, unitPrice: 5500 }],
  },
];

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' | 'destructive' }> = {
  PLACED: { label: 'Placed', variant: 'secondary' },
  ASSIGNED: { label: 'Assigned', variant: 'warning' },
  ON_THE_WAY: { label: 'On the way', variant: 'default' },
  DELIVERED: { label: 'Delivered', variant: 'default' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const [expanded, setExpanded] = useState<string | null>(MOCK_ORDERS[0]?.id ?? null);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(26,107,58,0.08)] text-4xl">📦</div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Login to view orders</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
          Sign in to see your order history and track deliveries.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">Orders</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Order history</h1>
      </div>

      {MOCK_ORDERS.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="text-5xl">📦</div>
          <h2 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">No orders yet</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Your completed purchases will appear here.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/products">Start shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
            const isExpanded = expanded === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-bg-subtle)]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="font-bold text-[var(--color-text-primary)]">#{order.id}</div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-[var(--color-text-primary)]">
                      NGN {order.grandTotal.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{isExpanded ? 'Hide details' : 'View details'}</div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--color-border-default)] px-5 py-5">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.title} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-[var(--color-text-primary)]">{item.title}</div>
                            <div className="text-xs text-[var(--color-text-secondary)]">Qty {item.quantity}</div>
                          </div>
                          <div className="font-semibold text-[var(--color-text-primary)]">
                            NGN {(item.unitPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status === 'ON_THE_WAY' && (
                      <div className="mt-5 rounded-2xl bg-[rgba(26,107,58,0.06)] p-4">
                        <div className="text-sm font-bold text-[var(--color-text-primary)]">In transit</div>
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Estimated arrival: today by 6 PM.</p>
                      </div>
                    )}

                    <Separator className="my-5" />

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="rounded-full">Reorder</Button>
                      <Button variant="secondary" className="rounded-full">Get help</Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
