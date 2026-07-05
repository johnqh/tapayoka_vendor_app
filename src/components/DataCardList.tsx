import { type ReactNode } from 'react';
import { Button, Text } from '@sudobility/components';
import { ui } from '@sudobility/design';

export interface DataCardListProps<T> {
  /** Rows to render. */
  data: T[];
  /** Stable key for each row. */
  keyExtractor: (row: T) => string;
  /**
   * Free-form, mobile-friendly cell for a row. Compose whatever layout you
   * want (title, metadata, badges, action icons); it stacks naturally on
   * narrow screens.
   */
  renderItem: (row: T) => ReactNode;
  /** Optional row click (e.g. navigate to detail). Action icons inside the
   * cell should call `e.stopPropagation()`. */
  onItemClick?: (row: T) => void;
  /** Message shown when there are no rows. */
  emptyMessage?: string;
  className?: string;
}

/**
 * A vertical list of free-form cards — the mobile-friendly replacement for a
 * fixed-column table. Each row is one free-form cell that wraps/stacks on small
 * screens instead of overflowing horizontally.
 */
export function DataCardList<T>({
  data,
  keyExtractor,
  renderItem,
  onItemClick,
  emptyMessage = 'No data yet.',
  className,
}: DataCardListProps<T>) {
  const containerClass = 'bg-background rounded-lg border border-border overflow-hidden';

  if (data.length === 0) {
    return (
      <div className={`${containerClass} p-8 text-center`}>
        <Text size="sm" color="muted">
          {emptyMessage}
        </Text>
      </div>
    );
  }

  return (
    <ul className={`${containerClass} divide-y divide-theme-border-light ${className ?? ''}`}>
      {data.map((row) => (
        <li key={keyExtractor(row)}>
          <div
            className={`px-4 py-3 ${
              onItemClick ? `cursor-pointer hover:bg-accent ${ui.transition.default}` : ''
            }`}
            onClick={onItemClick ? () => onItemClick(row) : undefined}
          >
            {renderItem(row)}
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Compact icon action button for a card cell. Stops propagation so it doesn't
 * trigger the row's `onItemClick`.
 */
export function RowIconButton({
  icon,
  label,
  onClick,
  variant = 'default',
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const tone = disabled
    ? 'text-muted-foreground cursor-not-allowed'
    : variant === 'danger'
      ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
      : variant === 'primary'
        ? 'text-primary hover:text-primary/80 hover:bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent';

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`h-auto w-auto p-1.5 ${tone}`}
    >
      {icon}
    </Button>
  );
}

export default DataCardList;
