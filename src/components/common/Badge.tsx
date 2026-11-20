import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-pill transition-colors',
        {
          'bg-surface-secondary text-text-secondary border border-border': variant === 'default',
          'bg-primary/15 text-primary-light border border-primary/30': variant === 'primary',
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30': variant === 'success',
          'bg-amber-500/15 text-amber-400 border border-amber-500/30': variant === 'warning',
          'bg-sky-500/15 text-sky-400 border border-sky-500/30': variant === 'info',
          'bg-purple-500/15 text-purple-400 border border-purple-500/30': variant === 'purple',
          'bg-transparent text-text-muted border border-border': variant === 'outline',

          'text-[10px] px-2 py-0.5': size === 'sm',
          'text-xs px-2.5 py-1': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
