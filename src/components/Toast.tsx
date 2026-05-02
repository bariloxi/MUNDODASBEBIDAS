'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (type !== 'loading') {
      setTimeout(() => hideToast(id), 5000);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-5 py-4 min-w-[300px] max-w-[450px] animate-in slide-in-from-right-10 fade-in duration-300",
              "glass shadow-2xl border-l-4",
              toast.type === 'success' && "border-l-success bg-success/10",
              toast.type === 'error' && "border-l-danger bg-danger/10",
              toast.type === 'info' && "border-l-primary bg-primary/10",
              toast.type === 'loading' && "border-l-zinc-500 bg-zinc-500/10"
            )}
          >
            <div className={cn(
              "flex-shrink-0",
              toast.type === 'success' && "text-success",
              toast.type === 'error' && "text-danger",
              toast.type === 'info' && "text-primary",
              toast.type === 'loading' && "text-zinc-500"
            )}>
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
              {toast.type === 'loading' && <Loader2 size={20} className="animate-spin" />}
            </div>
            <p className="text-sm font-semibold text-white flex-1">{toast.message}</p>
            <button
              onClick={() => hideToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
