import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  return <div className="flow-root">{children}</div>;
}

interface TimelineItemProps {
  children: ReactNode;
  isLast?: boolean;
}

export function TimelineItem({ children, isLast }: TimelineItemProps) {
  return (
    <div className={clsx('relative pb-8', !isLast && 'mb-4')}>
      {!isLast && (
        <span
          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

interface TimelineIconProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'error' | 'info' | 'warning';
}

export function TimelineIcon({ children, variant = 'default' }: TimelineIconProps) {
  return (
    <div className="relative flex items-start">
      <span
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-surface-elevated',
          {
            'bg-text-tertiary': variant === 'default',
            'bg-status-success': variant === 'success',
            'bg-status-error': variant === 'error',
            'bg-status-info': variant === 'info',
            'bg-status-warning': variant === 'warning',
          }
        )}
      >
        <span className="text-text-on-primary text-sm">{children}</span>
      </span>
    </div>
  );
}

interface TimelineContentProps {
  children: ReactNode;
  className?: string;
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return <div className={clsx('ml-12 -mt-8', className)}>{children}</div>;
}

interface TimelineHeadingProps {
  children: ReactNode;
}

export function TimelineHeading({ children }: TimelineHeadingProps) {
  return <h3 className="text-sm font-semibold text-text-primary">{children}</h3>;
}

interface TimelineDescriptionProps {
  children: ReactNode;
}

export function TimelineDescription({ children }: TimelineDescriptionProps) {
  return <p className="mt-1 text-sm text-text-secondary">{children}</p>;
}

interface TimelineTimeProps {
  children: ReactNode;
}

export function TimelineTime({ children }: TimelineTimeProps) {
  return <time className="text-xs text-text-tertiary">{children}</time>;
}
