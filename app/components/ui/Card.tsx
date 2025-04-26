import React from 'react';
import clsx from 'clsx';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={clsx(
        'bg-brand-surface/90 text-brand-cream border-brand-gold/10 hover:border-brand-gold/40 rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-200 hover:shadow-gold-glow',
        className
      )}
    />
  );
};
