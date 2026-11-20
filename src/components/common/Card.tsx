import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'primary',
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-card border transition-all duration-200',
        {
          'bg-surface border-border shadow-card': variant === 'primary',
          'bg-surface-secondary border-border/80': variant === 'secondary',
          'glass-panel border-border/60 shadow-elevated': variant === 'glass',
          'hover:border-border-hover hover:translate-y-[-1px]': hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
