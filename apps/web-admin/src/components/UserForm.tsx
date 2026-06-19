'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormData } from '../lib/validations/userSchema';
import { FormField } from './FormField';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<UserFormData>;
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      username: '',
      email: '',
      phone: '',
      password: '',
      isAdmin: false,
      isFarmer: true,
      isAgricEnterprise: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Username"
        name="username"
        placeholder="aminabella"
        error={errors.username?.message}
        required
      >
        <Input
          {...register('username')}
          placeholder="aminabella"
          className={errors.username ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="amina@aisuce.com"
        error={errors.email?.message}
        required
      >
        <Input
          {...register('email')}
          type="email"
          placeholder="amina@aisuce.com"
          className={errors.email ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        label="Phone"
        name="phone"
        type="tel"
        placeholder="+2348012345678"
        error={errors.phone?.message}
        required
      >
        <Input
          {...register('phone')}
          type="tel"
          placeholder="+2348012345678"
          className={errors.phone ? 'border-red-500' : ''}
        />
      </FormField>

      <FormField
        label="Password"
        name="password"
        placeholder="Minimum 8 characters"
        error={errors.password?.message}
        required
      >
        <Input
          {...register('password')}
          type="password"
          placeholder="Minimum 8 characters"
          className={errors.password ? 'border-red-500' : ''}
        />
      </FormField>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Farmer" name="isFarmer">
          <Select {...register('isFarmer')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>
        <FormField label="Enterprise" name="isAgricEnterprise">
          <Select {...register('isAgricEnterprise')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>
        <FormField label="Admin" name="isAdmin">
          <Select {...register('isAdmin')}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormField>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
};