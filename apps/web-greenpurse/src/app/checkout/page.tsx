'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<'details' | 'payment' | 'confirm'>('details');
  const [loading, setLoading] = useState(false);

  const total = subtotal();
  const deliveryFee = total >= 5000 ? 0 : 500;
  const platformFee = total * 0.1;
  const grandTotal = total + deliveryFee + platformFee;

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    notes: '',
    paymentMethod: 'wallet' as 'wallet' | 'paystack',
  });

  if (!user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(26,107,58,0.08)] text-4xl">🔒</div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Login to checkout</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
          Sign in to complete your order and keep your delivery details saved for faster checkout.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(26,107,58,0.08)] text-4xl">🛒</div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Your cart is empty</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
          Add a few items before you move to checkout.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/products">Shop now</Link>
        </Button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    clearCart();
    setLoading(false);
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-green-600)] text-3xl text-white shadow-[0_14px_32px_rgba(26,107,58,0.25)]">✓</div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Order placed</h1>
        <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--color-text-secondary)]">
          Your order has been submitted successfully. You&apos;ll receive updates as it moves through fulfillment.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/orders">View orders</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'details', label: 'Delivery details' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirm', label: 'Review' },
  ] as const;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">Checkout</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Complete your order</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {steps.slice(0, 2).map((item, index) => {
              const active = (step === 'details' && index === 0) || (step === 'payment' && index <= 1);
              return (
                <div
                  key={item.key}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    active
                      ? 'border-[rgba(26,107,58,0.2)] bg-[rgba(26,107,58,0.08)] text-[var(--color-green-800)]'
                      : 'border-[var(--color-border-default)] bg-white text-[var(--color-text-secondary)]'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-[var(--color-green-600)] text-white' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'}`}>
                    {index + 1}
                  </span>
                  {item.label}
                </div>
              );
            })}
          </div>

          {step === 'details' && (
            <Card className="p-5 md:p-6">
              <div className="text-lg font-extrabold text-[var(--color-text-primary)]">Delivery information</div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Tell us where to bring your order.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input
                  label="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Chinedu Okafor"
                />
                <Input
                  label="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08012345678"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Delivery address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="15 Adeola Odeku Street"
                  />
                </div>
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Victoria Island"
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="Lagos"
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">Order notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    placeholder="Any special instructions..."
                    className="ui-input min-h-[120px] resize-y"
                  />
                </div>
              </div>

              <Button className="mt-6 w-full rounded-full" onClick={() => setStep('payment')}>
                Continue to payment
              </Button>
            </Card>
          )}

          {step === 'payment' && (
            <Card className="p-5 md:p-6">
              <div className="text-lg font-extrabold text-[var(--color-text-primary)]">Payment method</div>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Choose how you want to pay.</p>

              <div className="mt-6 space-y-3">
                {[
                  { value: 'wallet', label: 'GreenPurse Wallet', desc: 'Use your wallet balance instantly.' },
                  { value: 'paystack', label: 'Card or bank transfer', desc: 'Pay securely via Paystack.' },
                ].map((option) => {
                  const selected = form.paymentMethod === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: option.value as 'wallet' | 'paystack' })}
                      className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-[rgba(26,107,58,0.25)] bg-[rgba(26,107,58,0.06)]'
                          : 'border-[var(--color-border-default)] bg-white hover:bg-[var(--color-bg-subtle)]'
                      }`}
                    >
                      <span className="text-2xl">💳</span>
                      <span>
                        <span className="block text-sm font-bold text-[var(--color-text-primary)]">{option.label}</span>
                        <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">{option.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button
                  className="flex-[1.6] rounded-full"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place order - NGN ${grandTotal.toLocaleString()}`}
                </Button>
              </div>
            </Card>
          )}
        </div>

        <Card className="h-fit p-5 md:sticky md:top-24">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-green-600)]">Summary</div>
          <h2 className="mt-2 text-xl font-extrabold text-[var(--color-text-primary)]">Order summary</h2>
          <Separator className="my-5" />

          <div className="space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-[var(--color-text-primary)]">{item.product.title}</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Qty {item.quantity}</div>
                </div>
                <div className="font-semibold text-[var(--color-text-primary)]">
                  NGN {(Number(item.product.price) * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal</span>
              <span className="font-semibold">NGN {total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Delivery</span>
              <span className="font-semibold">{deliveryFee === 0 ? 'Free' : `NGN ${deliveryFee.toLocaleString()}`}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Platform fee</span>
              <span className="font-semibold">NGN {platformFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-base font-black">
              <span>Total</span>
              <span>NGN {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
