'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { spacing } from './design-system';

export interface ClusterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The spacing between items. Maps to the spacing scale in design-system.ts
   */
  space?: keyof typeof spacing;
  /**
   * The alignment of items along the main axis
   */
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  /**
   * The alignment of items along the cross axis
   */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  /**
   * Whether to wrap items to multiple lines
   */
  wrap?: boolean;
}

const justifyClasses = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const;

const alignClasses = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
} as const;

/**
 * Cluster component for horizontal layouts with consistent spacing and wrapping
 */
export const Cluster = React.forwardRef<HTMLDivElement, ClusterProps>(
  ({ className, space = 4, justify = 'start', align = 'center', wrap = true, ...props }, ref) => {
    const clusterClasses = cn(
      'flex',
      {
        'flex-wrap': wrap,
        'flex-nowrap': !wrap,
        [`gap-${space}`]: true,
      },
      justifyClasses[justify],
      alignClasses[align],
      className
    );

    return <div ref={ref} className={clusterClasses} {...props} />;
  }
);

Cluster.displayName = 'Cluster';
