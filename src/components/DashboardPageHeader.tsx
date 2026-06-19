import {
  ChevronLeftIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { ui } from '@sudobility/design';

export interface DashboardPageHeaderProps {
  /** Page / detail title. */
  title: string;
  /** When provided, renders a back chevron before the title. */
  onBack?: () => void;
  /** When provided, renders a refresh icon button. */
  onRefresh?: () => void;
  /** Spins the refresh icon while a refresh is in flight. */
  refreshing?: boolean;
  /** When provided, renders a gear (settings) icon button. */
  onSettings?: () => void;
  /** When provided, renders a primary "+" add button (rightmost). */
  onAdd?: () => void;
  /** Label for the add button (default "Add"). */
  addLabel?: string;
  /** Disables the add button (e.g. action only available in the mobile app). */
  addDisabled?: boolean;
  /** Tooltip for the add button, useful when disabled. */
  addTitle?: string;
}

const iconButtonClass =
  'p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors';

/**
 * Consistent header for every dashboard list/detail page:
 *
 *   [‹]  Title                          [⟳ refresh] [⚙ settings] [+ add]
 *
 * Back chevron and each action are opt-in via their handler props; the add
 * button is always rendered rightmost.
 */
export function DashboardPageHeader({
  title,
  onBack,
  onRefresh,
  refreshing,
  onSettings,
  onAdd,
  addLabel = 'Add',
  addDisabled,
  addTitle,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="-ml-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}
      <h1 className={`${ui.text.h3} flex-1 min-w-0 truncate`}>{title}</h1>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            title="Refresh"
            className={iconButtonClass}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            aria-label="Settings"
            title="Settings"
            className={iconButtonClass}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        )}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            aria-label={addLabel}
            title={addTitle ?? addLabel}
            className={`p-2 rounded-lg transition-colors ${
              addDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardPageHeader;
