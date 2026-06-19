'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full ${sizeStyles[size]}`}
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--color-bg-subtle)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
