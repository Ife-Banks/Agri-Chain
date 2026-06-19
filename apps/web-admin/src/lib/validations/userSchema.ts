import { z } from 'zod';

export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100, 'Username must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isAdmin: z.boolean().optional().default(false),
  isFarmer: z.boolean().optional().default(true),
  isAgricEnterprise: z.boolean().optional().default(false),
});

export type UserFormData = z.infer<typeof userSchema>;