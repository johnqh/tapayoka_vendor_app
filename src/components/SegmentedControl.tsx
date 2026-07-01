import React from 'react';
import { cn } from '../lib/cn';

export interface SegmentedControlOption {
  /** Option value */
  value: string;
  /** Option label */
  label: React.ReactNode;
  /** One-line explanation of this option (shown by SegmentedField when selected). */
  description?: string;
  /** Option icon */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Available options */
  options: SegmentedControlOption[];
  /** Selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className on the container */
  className?: string;
}

const sizeClasses: Record<NonNullable<SegmentedControlProps['size']>, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
};

/**
 * SegmentedControl — an iOS-style single-select toggle group. Ported from the
 * ToggleGroup in @sudobility/mail_box_components and adapted to this app's
 * theme utility classes.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      className={cn('flex w-full rounded-lg bg-theme-bg-secondary p-1 gap-1', className)}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !option.disabled && onChange?.(option.value)}
            disabled={option.disabled}
            aria-pressed={selected}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-md font-medium',
              'transition-all duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              selected
                ? 'bg-theme-bg-primary text-theme-text-primary shadow-sm'
                : 'text-theme-text-secondary hover:bg-theme-hover-bg'
            )}
          >
            {option.icon && <span className="flex-shrink-0 w-4 h-4">{option.icon}</span>}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
