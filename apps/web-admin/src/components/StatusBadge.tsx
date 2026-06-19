'use client';
import React from 'react';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  Inactive: { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  'Out of Stock': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  Processing: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Shipped: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  Delivered: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  Cancelled: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const config = statusConfig[status] || statusConfig.Active;

  return (
    <Badge
      variant={
        status === 'Active' || status === 'Delivered'
          ? 'success'
          : status === 'Pending'
          ? 'warning'
          : status === 'Processing'
          ? 'info'
          : status === 'Out of Stock' || status === 'Cancelled'
          ? 'destructive'
          : 'secondary'
      }
      className={`inline-flex items-center gap-1.5 ${sizeStyles[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </Badge>
  );
};
