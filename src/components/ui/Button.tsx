import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-text-on-primary hover:bg-primary-hover focus-visible:ring-primary':
            variant === 'primary',
          'bg-surface text-text-primary hover:bg-surface-elevated border border-border focus-visible:ring-primary':
            variant === 'secondary',
          'border border-border bg-surface-elevated hover:bg-surface text-text-primary focus-visible:ring-primary':
            variant === 'outline',
          'hover:bg-surface text-text-primary focus-visible:ring-primary': variant === 'ghost',
          'bg-accent-red text-text-on-primary hover:bg-accent-red-light focus-visible:ring-accent-red':
            variant === 'danger',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
