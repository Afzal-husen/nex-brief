'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string, persistent?: boolean) => string;
  info: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, persistent = false }: Omit<ToastItem, 'id'>): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, persistent };

      setToasts((prev) => [...prev, newToast]);

      if (!persistent) {
        setTimeout(() => {
          dismissToast(id);
        }, 4000);
      }

      return id;
    },
    [dismissToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, persistent = false) =>
      showToast({ type: 'error', title, message, persistent }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; border: string; bg: string; text: string }
  > = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
      border: 'border-emerald-500/30',
      bg: 'bg-zinc-900/95',
      text: 'text-zinc-100',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
      border: 'border-red-500/30',
      bg: 'bg-zinc-900/95',
      text: 'text-zinc-100',
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      border: 'border-indigo-500/30',
      bg: 'bg-zinc-900/95',
      text: 'text-zinc-100',
    },
  };

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, dismissToast, success, error, info }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${config.border} ${config.bg} shadow-xl shadow-black/60 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150`}
            >
              {config.icon}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${config.text}`}>{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded cursor-pointer transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
