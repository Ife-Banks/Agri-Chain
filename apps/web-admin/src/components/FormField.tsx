'use client';
import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required = false,
  children,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children || (
        <Input
          type={type}
          name={name}
          placeholder={placeholder}
          className={error ? 'border-red-500' : ''}
        />
      )}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
};
