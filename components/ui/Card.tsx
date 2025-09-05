'use client';

import { cn } from '@/lib/utils';
import { CardProps } from '@/lib/types';

export function Card({
  variant = 'default',
  className = '',
  children,
  onClick,
}: CardProps) {
  const baseClasses = 'transition-all duration-200';
  
  const variantClasses = {
    default: 'glass-card p-6',
    product: 'product-card',
    offer: 'offer-card',
    metric: 'metric-card',
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
    >
      {children}
    </Component>
  );
}
