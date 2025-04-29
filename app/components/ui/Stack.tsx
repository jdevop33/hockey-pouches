'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { spacing } from './design-system';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The spacing between items. Maps to the spacing scale in design-system.ts
   */
  space?: keyof typeof spacing;
  /**
   * Whether to reverse the order of items
   */
  reverse?: boolean;
  /**
   * Whether to recursively apply spacing to all children
   */
  recursive?: boolean;
  /**
   * Whether to split the space between items evenly
   */
  splitSpace?: boolean;
}

/**
 * Stack component for vertical layouts with consistent spacing
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    { className, space = 4, reverse = false, recursive = false, splitSpace = false, ...props },
    ref
  ) => {
    const stackClasses = cn(
      'flex flex-col',
      {
        'flex-col-reverse': reverse,
        'justify-between h-full': splitSpace,
        [`[&>*+*]:mt-${space}]`]: !recursive && !splitSpace,
        [`[&_*+*]:mt-${space}]`]: recursive && !splitSpace,
      },
      className
    );

    return <div ref={ref} className={stackClasses} {...props} />;
  }
);

Stack.displayName = 'Stack';
