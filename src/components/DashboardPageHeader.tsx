import { type ReactNode } from 'react';
import {
  ChevronLeftIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Button, Heading, Text } from '@sudobility/components';
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

const iconButtonClass = 'h-auto w-auto p-2 text-muted-foreground hover:text-foreground';

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
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-theme-border ${ui.background.subtle}`}
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="-ml-1 h-auto w-auto p-0 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
      )}
      <Heading level={1} size="lg" className="flex-1 min-w-0 truncate">
        {title}
      </Heading>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            title="Refresh"
            className={iconButtonClass}
          >
            <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
        {onSettings && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onSettings}
            aria-label="Settings"
            title="Settings"
            className={iconButtonClass}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </Button>
        )}
        {onAdd && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            aria-label={addLabel}
            title={addTitle ?? addLabel}
            className={`h-auto w-auto p-2 ${
              addDisabled
                ? 'text-theme-text-tertiary cursor-not-allowed'
                : 'text-primary hover:text-primary/80'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Footer band for a ContentLayout detail page — pinned to the bottom of the
 * scroll area to show information about the current object.
 */
export function DashboardDetailFooter({ children }: { children: ReactNode }) {
  return (
    <div className={`px-4 py-3 border-t border-theme-border ${ui.background.subtle}`}>
      <Text size="sm" color="muted">
        {children}
      </Text>
    </div>
  );
}

export default DashboardPageHeader;
