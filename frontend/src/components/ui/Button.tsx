'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm active:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary:
    'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium active:bg-zinc-750 focus-visible:ring-zinc-400',
  outline:
    'border border-zinc-750 hover:border-zinc-600 bg-zinc-900/50 hover:bg-zinc-800/60 text-zinc-200 font-medium focus-visible:ring-zinc-400',
  destructive:
    'bg-red-600 hover:bg-red-500 text-white font-medium active:bg-red-700 focus-visible:ring-red-500',
  ghost:
    'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 font-medium focus-visible:ring-zinc-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
  md: 'px-3.5 py-1.5 text-sm gap-2 rounded-lg',
  lg: 'px-4.5 py-2.5 text-base gap-2.5 rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyle =
      'inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 select-none';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
