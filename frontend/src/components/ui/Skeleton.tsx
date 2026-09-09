'use client';

import React from 'react';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-800/60 ${className}`}
      {...props}
    />
  );
};
