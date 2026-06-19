import { type ReactNode } from 'react';
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
  const containerClass =
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden';

  if (data.length === 0) {
    return (
      <div className={`${containerClass} p-8 text-center text-sm text-gray-500 dark:text-gray-400`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul
      className={`${containerClass} divide-y divide-gray-100 dark:divide-gray-700 ${className ?? ''}`}
    >
      {data.map((row) => (
        <li key={keyExtractor(row)}>
          <div
            className={`px-4 py-3 ${
              onItemClick
                ? `cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${ui.transition.default}`
                : ''
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
    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
    : variant === 'danger'
      ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
      : variant === 'primary'
        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`p-1.5 rounded-md transition-colors ${tone}`}
    >
      {icon}
    </button>
  );
}

export default DataCardList;
