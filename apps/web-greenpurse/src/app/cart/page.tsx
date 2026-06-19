'use client';

import Link from 'next/link';
import { useCartStore } from '../../store/cart';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

function QuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--color-border-default)] bg-white p-1">
      <button
        onClick={onDecrease}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-10 text-center text-sm font-semibold text-[var(--color-text-primary)]">{quantity}</span>
      <button
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-subtle)]"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const total = subtotal();
  const deliveryFee = total >= 5000 ? 0 : 500;
  const grandTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(26,107,58,0.08)] text-4xl">🛒</div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Your cart is empty</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
          Add fresh produce to your cart and we&apos;ll keep the checkout experience simple and elegant.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">Cart</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Shopping cart</h1>
        </div>
        <Badge variant="secondary">{items.length} item{items.length === 1 ? '' : 's'}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4 md:p-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href={`/products/${item.productId}`} className="shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || `https://picsum.photos/seed/${item.productId}/200/200`}
                    alt={item.product.title}
                    className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                    onError={(event) => {
                      (event.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.productId}/200/200`;
                    }}
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <Link href={`/products/${item.productId}`} className="group">
                        <h2 className="truncate text-lg font-bold text-[var(--color-text-primary)] transition group-hover:text-[var(--color-green-600)]">
                          {item.product.title}
                        </h2>
                      </Link>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        NGN {Number(item.product.price).toLocaleString()} per {item.product.kilogram}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-[var(--color-text-primary)]">
                        NGN {(Number(item.product.price) * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <QuantityControl
                      quantity={item.quantity}
                      onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                      onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                    />
                    <Button
                      variant="ghost"
                      className="rounded-full px-4 text-[var(--color-danger)]"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="h-fit p-5 md:sticky md:top-24">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">Summary</div>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--color-text-primary)]">Order summary</h2>
          <Separator className="my-5" />

          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-semibold text-[var(--color-text-primary)]">NGN {total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Delivery</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {deliveryFee === 0 ? 'Free' : `NGN ${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="rounded-2xl bg-[var(--color-bg-subtle)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                Add NGN {(5000 - total).toLocaleString()} more for free delivery.
              </p>
            )}
            <Separator />
            <div className="flex items-center justify-between text-base font-black">
              <span>Total</span>
              <span>NGN {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <Button asChild className="mt-6 w-full rounded-full">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full rounded-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
