'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from './utils';

type ToastType = 'default' | 'success' | 'error';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...item, id }]);
    window.setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

function ToastViewport() {
  const context = React.useContext(ToastContext);
  if (!context) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
      {context.toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-zinc-950',
            toast.type === 'success' && 'border-emerald-200 dark:border-emerald-900',
            toast.type === 'error' && 'border-red-200 dark:border-red-900',
            toast.type === 'default' && 'border-zinc-200 dark:border-zinc-800'
          )}
        >
          <div className="mt-0.5">
            {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
            {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-500" /> : null}
            {!toast.type || toast.type === 'default' ? <div className="h-5 w-5 rounded-full bg-zinc-900 dark:bg-zinc-50" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{toast.description}</p> : null}
          </div>
          <button type="button" onClick={() => context.dismiss(toast.id)} className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
