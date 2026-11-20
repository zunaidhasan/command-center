import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card transition-colors duration-150',
            'placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40',
            icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
