import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] select-none focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none',
          {
            // Variants
            'bg-primary text-white hover:bg-primary-hover shadow-sm shadow-primary/20': variant === 'primary',
            'bg-surface-secondary text-text-primary hover:bg-surface-hover border border-border': variant === 'secondary',
            'bg-transparent text-text-primary hover:bg-surface-secondary border border-border hover:border-text-secondary/40': variant === 'outline',
            'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60': variant === 'ghost',
            'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30': variant === 'danger',

            // Sizes
            'text-xs px-2.5 py-1.5 rounded-sm-card gap-1.5': size === 'sm',
            'text-sm px-3.5 py-2 rounded-sm-card gap-2': size === 'md',
            'text-base px-5 py-2.5 rounded-card gap-2.5': size === 'lg',
            'h-9 w-9 rounded-sm-card p-0 flex items-center justify-center': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
