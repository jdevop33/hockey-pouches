'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { grid, spacing } from './design-system';
import styles from './Grid.module.css';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns at different breakpoints
   * @example { base: 1, md: 2, lg: 3 }
   */
  columns?: {
    base?: keyof typeof grid.columns;
    sm?: keyof typeof grid.columns;
    md?: keyof typeof grid.columns;
    lg?: keyof typeof grid.columns;
    xl?: keyof typeof grid.columns;
  };
  /**
   * The gap between grid items. Maps to the spacing scale in design-system.ts
   */
  gap?: keyof typeof spacing;
  /**
   * The minimum width of each column before wrapping
   */
  minChildWidth?: string;
  /**
   * Whether to maintain a square aspect ratio for children
   */
  square?: boolean;
}

/**
 * Grid component for responsive grid layouts
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      columns = { base: 1, md: 2, lg: 3 },
      gap = 4,
      minChildWidth,
      square = false,
      ...props
    },
    ref
  ) => {
    // If minChildWidth is provided, use auto-fit grid
    const gridTemplateColumns = minChildWidth
      ? `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`
      : undefined;

    // Build responsive grid columns
    const responsiveColumns = !minChildWidth
      ? {
          'grid-cols-[1fr]': true,
          [`grid-cols-${columns.base}`]: columns.base !== undefined,
          [`sm:grid-cols-${columns.sm}`]: columns.sm !== undefined,
          [`md:grid-cols-${columns.md}`]: columns.md !== undefined,
          [`lg:grid-cols-${columns.lg}`]: columns.lg !== undefined,
          [`xl:grid-cols-${columns.xl}`]: columns.xl !== undefined,
        }
      : {};

    return (
      <div
        ref={ref}
        className={cn(
          styles.grid,
          {
            ...responsiveColumns,
            [`gap-${gap}`]: true,
            '[&>*]:aspect-square': square,
          },
          className
        )}
        {...props}
        style={
          { ...props.style, '--grid-template-columns': gridTemplateColumns } as React.CSSProperties
        }
      />
    );
  }
);

Grid.displayName = 'Grid';
