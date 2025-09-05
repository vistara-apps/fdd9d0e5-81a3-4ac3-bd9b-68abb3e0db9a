'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'metric' | 'product';
}

export function SkeletonCard({ className, variant = 'default' }: SkeletonCardProps) {
  if (variant === 'metric') {
    return (
      <div className={cn('glass-card p-6 animate-pulse', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-surface-hover rounded-lg" />
          <div className="w-16 h-6 bg-surface-hover rounded" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-8 bg-surface-hover rounded" />
          <div className="w-32 h-4 bg-surface-hover rounded" />
        </div>
      </div>
    );
  }

  if (variant === 'product') {
    return (
      <div className={cn('glass-card p-4 animate-pulse', className)}>
        <div className="w-full h-48 bg-surface-hover rounded-lg mb-4" />
        <div className="space-y-2">
          <div className="w-3/4 h-5 bg-surface-hover rounded" />
          <div className="w-1/2 h-4 bg-surface-hover rounded" />
          <div className="flex justify-between items-center mt-4">
            <div className="w-20 h-6 bg-surface-hover rounded" />
            <div className="w-24 h-8 bg-surface-hover rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6 animate-pulse', className)}>
      <div className="space-y-4">
        <div className="w-3/4 h-6 bg-surface-hover rounded" />
        <div className="space-y-2">
          <div className="w-full h-4 bg-surface-hover rounded" />
          <div className="w-5/6 h-4 bg-surface-hover rounded" />
          <div className="w-4/6 h-4 bg-surface-hover rounded" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-hover', className)}
      role="status"
      aria-label="Loading content"
    />
  );
}
