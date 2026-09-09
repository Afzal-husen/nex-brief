'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, isInteractive = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-zinc-900 border border-zinc-800/90 rounded-xl p-5 text-zinc-100 ${
          isInteractive
            ? 'hover:border-zinc-700 transition-all duration-150 hover:shadow-lg hover:shadow-black/30 cursor-pointer'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
