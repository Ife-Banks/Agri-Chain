'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'var(--color-green-600)'
}) => {
  return (
    <div className={`flex items-center justify-center ${sizeStyles[size]}`}>
      <motion.div
        className={`border-4 rounded-full ${sizeStyles[size]}`}
        style={{
          borderColor: 'var(--color-border-default)',
          borderTopColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};
