'use client';

import { cn } from '@/lib/utils';
import { ButtonProps } from '@/lib/types';
import { LoadingSpinner } from './LoadingSpinner';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'btn-primary focus:ring-primary',
    secondary: 'btn-secondary focus:ring-secondary',
    accent: 'btn-accent focus:ring-accent',
    outline: 'border border-border text-text-primary hover:bg-surface-hover focus:ring-border-light',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
}
