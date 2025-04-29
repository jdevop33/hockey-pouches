'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Stack } from './Stack';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The title of the empty state
   */
  title: string;
  /**
   * The description of the empty state
   */
  description?: string;
  /**
   * The illustration to show
   */
  illustration?: React.ReactNode;
  /**
   * The action button or link
   */
  action?: React.ReactNode;
  /**
   * The size of the empty state
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to center the content
   */
  centered?: boolean;
}

/**
 * EmptyState component for displaying empty states with illustrations and actions
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, title, description, illustration, action, size = 'md', centered = true, ...props },
    ref
  ) => {
    const sizeClasses = {
      sm: {
        container: 'p-4',
        title: 'text-lg font-semibold',
        description: 'text-sm',
      },
      md: {
        container: 'p-6',
        title: 'text-xl font-semibold',
        description: 'text-base',
      },
      lg: {
        container: 'p-8',
        title: 'text-2xl font-semibold',
        description: 'text-lg',
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
          sizeClasses[size].container,
          {
            'flex items-center justify-center': centered,
          },
          className
        )}
        {...props}
      >
        <Stack
          space={6}
          className={cn({
            'items-center text-center': centered,
          })}
        >
          {illustration && (
            <div
              className={cn('flex justify-center', {
                'h-24 w-24': size === 'sm',
                'h-32 w-32': size === 'md',
                'h-40 w-40': size === 'lg',
              })}
            >
              {illustration}
            </div>
          )}
          <div className="space-y-2">
            <h3 className={sizeClasses[size].title}>{title}</h3>
            {description && (
              <p className={cn('text-gray-500 dark:text-gray-400', sizeClasses[size].description)}>
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </Stack>
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
