'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../store/auth';
import { Eye, EyeOff, X, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s: any) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 900));

    if (form.email && form.password.length >= 8) {
      const isFarmer = form.email.toLowerCase().includes('farmer');
      setAuth(
        { id: 'u1', email: form.email, username: form.email.split('@')[0], roles: isFarmer ? ['farmer'] : ['buyer'] },
        'mock-jwt-token-123'
      );
      router.push(isFarmer ? '/farmer' : '/');
    } else {
      setError('Enter a valid email and a password with at least 8 characters.');
    }

    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    await new Promise((r) => setTimeout(r, 1500));
    const isFarmer = provider === 'apple';
    setAuth(
      { id: `u-${provider}`, email: `${provider}@example.com`, username: provider.charAt(0).toUpperCase() + provider.slice(1), roles: isFarmer ? ['farmer'] : ['buyer'] },
      `mock-oauth-token-${provider}`
    );
    setOauthLoading(null);
    router.push(isFarmer ? '/farmer' : '/');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setForgotSent(true);
  };

  return (
    <>
      <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1280px] items-stretch gap-6 px-4 py-6 md:px-6 md:py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-[0_20px_60px_rgba(15,74,40,0.16)]"
          style={{ background: 'linear-gradient(145deg, #0f4a28 0%, #1a6b3a 56%, #2d8a50 100%)' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_24%)]" />
          <div
            className={`relative flex h-full flex-col justify-end transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <div className="max-w-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">GreenPurse</div>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                A cleaner way to buy fresh produce.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-8 text-white/80 md:text-lg">
                Log in to manage your cart, track orders, and keep your checkout experience seamless.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className={`w-full max-w-[480px] p-6 md:p-8 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-700`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-green-600)]">Welcome back</div>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--color-text-primary)]">Sign in</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">Use your GreenPurse account to continue.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="rounded-full border-[var(--color-border-default)]"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === 'google' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Google
              </Button>
              <Button
                variant="secondary"
                className="rounded-full border-[var(--color-border-default)]"
                onClick={() => handleOAuth('apple')}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === 'apple' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                )}
                Apple
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--color-border-default)]" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">or</span>
              <div className="h-px flex-1 bg-[var(--color-border-default)]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Input
                label="Email or phone"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <input type="checkbox" className="h-4 w-4 accent-[var(--color-green-600)]" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-semibold text-[var(--color-green-600)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
              New here?{' '}
              <Link href="/register" className="font-semibold text-[var(--color-green-600)]">
                Create an account
              </Link>
            </p>
          </Card>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <button onClick={() => { setShowForgotModal(false); setForgotSent(false); setForgotEmail(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {!forgotSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-gray-500">Enter your email address and we'll send you a link to reset your password.</p>
                <Input
                  label="Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                />
                <Button type="submit" className="w-full rounded-xl" disabled={loading || !forgotEmail}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-500">
                  We've sent a password reset link to <strong>{forgotEmail}</strong>
                </p>
                <Button onClick={() => { setShowForgotModal(false); setForgotSent(false); setForgotEmail(''); }} className="mt-4 w-full rounded-xl">
                  Got it
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}