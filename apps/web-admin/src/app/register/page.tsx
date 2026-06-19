'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Globe, Eye, EyeOff, GitBranch, Mail, LockKeyhole, UserRound, ArrowRight } from 'lucide-react';
import { authApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { useToast } from '../../components/ui/toast';

const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    role: z.enum(['farmer', 'buyer', 'agric_enterprise']),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
    terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
      role: 'farmer',
      password: '',
      confirmPassword: '',
      terms: true,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
      });
      toast({
        title: 'Account created',
        description: 'Your admin profile has been set up successfully.',
        type: 'success',
      });
      router.push('/login');
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message || 'Could not create account. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="overflow-hidden border-white/10 bg-white/95 text-zinc-950 shadow-soft backdrop-blur-xl dark:bg-zinc-950/90 dark:text-zinc-50">
        <CardHeader className="space-y-4 border-b border-zinc-200/70 bg-zinc-50/80 p-8 dark:border-zinc-800/70 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">AI-SUCE</p>
                <CardTitle className="text-2xl">Create account</CardTitle>
              </div>
            </div>
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900 sm:inline-flex"
            >
              Back to login
            </Link>
          </div>
          <CardDescription className="text-sm sm:text-base">
            Set up your admin account to manage products, orders, and reporting with the new interface.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-11 justify-center border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
              <Globe className="h-4 w-4" />
              Sign up with Google
            </Button>
            <Button variant="outline" className="h-11 justify-center border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
              <GitBranch className="h-4 w-4" />
              Sign up with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">or create with email</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input id="username" placeholder="aminabella" className="h-11 pl-9" {...register('username')} />
              </div>
              {errors.username ? <p className="text-sm text-red-500">{errors.username.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input id="email" type="email" placeholder="amina@aisuce.com" className="h-11 pl-9" {...register('email')} />
              </div>
              {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Input id="phone" type="tel" placeholder="+2348012345678" className="h-11" {...register('phone')} />
              </div>
              {errors.phone ? <p className="text-sm text-red-500">{errors.phone.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" {...register('role')}>
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="agric_enterprise">Agric Enterprise</option>
              </Select>
              {errors.role ? <p className="text-sm text-red-500">{errors.role.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="h-11 pr-11"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-950 dark:hover:text-zinc-50"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword ? <p className="text-sm text-red-500">{errors.confirmPassword.message}</p> : null}
            </div>

            <label className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Checkbox {...register('terms')} />
              <span>
                I agree to the terms, privacy policy, and admin access guidelines.
              </span>
            </label>
            {errors.terms ? <p className="text-sm text-red-500">{errors.terms.message}</p> : null}

            <Button type="submit" loading={isSubmitting} className="h-11 w-full">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-zinc-950 transition hover:text-emerald-600 dark:text-zinc-50 dark:hover:text-emerald-400">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
