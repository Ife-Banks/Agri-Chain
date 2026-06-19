'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../lib/validations/productSchema';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { useCategories } from '../hooks/useCategories';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<ProductFormData>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
}) => {
  const { categories } = useCategories();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      categoryId: '',
      price: 0,
      kilogram: 1,
      stock: 0,
      condition: 'Fresh',
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Product Name"
        name="title"
        placeholder="Enter product name"
        error={errors.title?.message}
        required
      >
        <Input
          {...register('title')}
          placeholder="Enter product name"
          className={errors.title ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        label="Description"
        name="description"
        placeholder="Describe the product (min 20 characters)"
        error={errors.description?.message}
        required
      >
        <Textarea
          {...register('description')}
          placeholder="High quality locally grown produce from verified farms..."
          className={errors.description ? 'border-red-500' : ''}
          rows={3}
        />
      </FormField>

      <FormField
        label="Category"
        name="categoryId"
        error={errors.categoryId?.message}
      >
        <Select {...register('categoryId')}>
          <option value="">Select category</option>
          {(categories as any[]).map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Price (₦)"
          name="price"
          placeholder="0.00"
          error={errors.price?.message}
          required
        >
          <Input
            {...register('price', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={errors.price ? 'border-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Weight (kg)"
          name="kilogram"
          placeholder="1"
          error={errors.kilogram?.message}
        >
          <Input
            {...register('kilogram', { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0.01"
            placeholder="1"
            className={errors.kilogram ? 'border-red-500' : ''}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Stock"
          name="stock"
          placeholder="0"
          error={errors.stock?.message}
          required
        >
          <Input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            min="0"
            placeholder="0"
            className={errors.stock ? 'border-red-500' : ''}
          />
        </FormField>

        <FormField
          label="Condition"
          name="condition"
          error={errors.condition?.message}
        >
          <Select {...register('condition')}>
            <option value="Fresh">Fresh</option>
            <option value="Dried">Dried</option>
            <option value="Processed">Processed</option>
          </Select>
        </FormField>
      </div>

      <FormField
        label="Active"
        name="isActive"
      >
        <Select {...register('isActive')}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
      </FormField>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};