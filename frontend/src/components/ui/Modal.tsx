'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthMap[maxWidth]} bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-zinc-800/80">
            <div>
              {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
              {description && (
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
