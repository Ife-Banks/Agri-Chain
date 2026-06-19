'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'buyer' as 'buyer' | 'farmer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 1000));

    if (form.username && form.email && form.phone && form.password.length >= 8) {
      setAuth(
        { id: 'u-new', email: form.email, username: form.username, roles: [form.role] },
        'mock-jwt-token-new'
      );
      router.push(form.role === 'farmer' ? '/farmer' : '/');
    } else {
      setError('Please complete all fields and use a password with at least 8 characters.');
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1280px] items-stretch gap-6 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="overflow-hidden p-0">
        <div className="h-full bg-[linear-gradient(145deg,#0f4a28_0%,#1a6b3a_55%,#2d8a50_100%)] p-8 text-white md:p-10">
          <Badge className="bg-white/15 text-white">Sell or buy</Badge>
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Create your GreenPurse account</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/80">
            Whether you&apos;re shopping for home or selling your harvest, the onboarding experience should feel premium and fast.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Fast verification',
              'Buyer and farmer roles',
              'Secure checkout',
              'Order tracking',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center">
        <Card className="w-full max-w-[520px] p-6 md:p-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">Join GreenPurse</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Create account</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
              A polished sign-up flow for buyers and farmers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="grid gap-3 sm:grid-cols-2">
              {(['buyer', 'farmer'] as const).map((role) => {
                const selected = form.role === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, role })}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      selected
                        ? 'border-[rgba(26,107,58,0.22)] bg-[rgba(26,107,58,0.07)]'
                        : 'border-[var(--color-border-default)] bg-white hover:bg-[var(--color-bg-subtle)]'
                    }`}
                  >
                    <div className="text-sm font-bold text-[var(--color-text-primary)]">
                      {role === 'buyer' ? '🛒 Buyer' : '🚜 Farmer'}
                    </div>
                    <div className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
                      {role === 'buyer' ? 'Shop fresh produce' : 'List and sell harvests'}
                    </div>
                  </button>
                );
              })}
            </div>

            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="chinedu_okafor"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
            />
            <Input
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08012345678"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 8 characters"
            />

            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[var(--color-green-600)]">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
