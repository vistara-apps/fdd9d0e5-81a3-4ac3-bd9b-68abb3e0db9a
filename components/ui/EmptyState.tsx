'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('text-center py-12', className)}>
      <div className="flex flex-col items-center space-y-4">
        {Icon && (
          <div className="p-4 bg-text-muted/10 rounded-full">
            <Icon className="w-8 h-8 text-text-muted" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-heading-4 text-text-primary">{title}</h3>
          <p className="text-body-small text-text-secondary max-w-md">
            {description}
          </p>
        </div>
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
          >
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
}

// Specific empty state variants
interface NoDataProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  className?: string;
}

export function NoDataState({
  title = 'No data available',
  description = 'There is no data to display at the moment. Try refreshing or check back later.',
  onRefresh,
  className,
}: NoDataProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
        variant: 'secondary'
      } : undefined}
      className={className}
    />
  );
}

interface NoResultsProps {
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}

export function NoResultsState({
  searchTerm,
  onClearSearch,
  className,
}: NoResultsProps) {
  const title = searchTerm ? `No results for "${searchTerm}"` : 'No results found';
  const description = searchTerm 
    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
    : 'No items match your current filters. Try adjusting your criteria.';

  return (
    <EmptyState
      title={title}
      description={description}
      action={onClearSearch ? {
        label: 'Clear Search',
        onClick: onClearSearch,
        variant: 'secondary'
      } : undefined}
      className={className}
    />
  );
}
