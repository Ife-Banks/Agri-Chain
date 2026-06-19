'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Globe, Eye, EyeOff, GitBranch, Mail, LockKeyhole, ArrowRight } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useAdminStore } from '../../store/adminStore';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAdminStore();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@aisuce.com',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { data } = await authApi.login({ email: values.email, password: values.password });
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      setCurrentUser({
        id: data.user.id,
        name: data.user.username || data.user.email,
        email: data.user.email,
        role: 'Admin',
        status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 10),
      });
      toast({
        title: 'Welcome back',
        description: 'You are now signed into the admin console.',
        type: 'success',
      });
      router.push('/');
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.response?.data?.message || 'Invalid credentials. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="w-full">
      <Card className="overflow-hidden border-white/10 bg-white/95 text-zinc-950 shadow-soft backdrop-blur-xl dark:bg-zinc-950/90 dark:text-zinc-50">
        <CardHeader className="space-y-4 border-b border-zinc-200/70 bg-zinc-50/80 p-8 dark:border-zinc-800/70 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">AI-SUCE</p>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
              </div>
            </div>
            <Badge variant="info" className="bg-sky-500/10 text-sky-600 dark:text-sky-300">
              Secure access
            </Badge>
          </div>
          <div>
            <CardDescription className="text-sm sm:text-base">
              Sign in to manage orders, users, products, and reporting from the refreshed admin experience.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-11 justify-center border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
              <Globe className="h-4 w-4" />
              Continue with Google
            </Button>
            <Button variant="outline" className="h-11 justify-center border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
              <GitBranch className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">or sign in with email</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input id="email" type="email" placeholder="admin@aisuce.com" className="h-11 pl-9" {...register('email')} />
              </div>
              {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-11 pr-11"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Checkbox {...register('rememberMe')} />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400">
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={isSubmitting} className="h-11 w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            New to the admin portal?{' '}
            <Link href="/register" className="font-medium text-zinc-950 transition hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-400">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
