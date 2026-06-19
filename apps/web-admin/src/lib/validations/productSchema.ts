import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(2, 'Product name must be at least 2 characters').max(200, 'Product name must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  kilogram: z.number().min(0.01, 'Weight must be greater than 0').optional(),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
  condition: z.enum(['Fresh', 'Dried', 'Processed']).optional().default('Fresh'),
  isActive: z.boolean().optional().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
