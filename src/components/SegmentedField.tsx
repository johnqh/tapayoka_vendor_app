import { Text } from '@sudobility/components';
import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl';

interface SegmentedFieldProps {
  label: string;
  options?: SegmentedControlOption[];
  value: string | null | undefined;
  onChange?: (value: string) => void;
  /**
   * Explicit description override. When omitted, the selected option's own
   * `description` is shown. Useful for controls (e.g. chip pickers) whose
   * descriptions live outside the options list.
   */
  description?: string;
  /** Render a custom control (defaults to a SegmentedControl over `options`). */
  children?: React.ReactNode;
}

/**
 * A labeled segmented control with a fixed-height (two-line) explanation area
 * below it describing the selected option. The area reserves two lines
 * regardless of content length so selecting different options never shifts the
 * surrounding layout.
 */
export function SegmentedField({
  label,
  options = [],
  value,
  onChange,
  description,
  children,
}: SegmentedFieldProps) {
  const selectedDescription =
    description ?? options.find((o) => o.value === value)?.description ?? '';

  return (
    <div>
      <Text as="label" size="sm" weight="medium" className="block mb-1">
        {label}
      </Text>
      {children ?? (
        <SegmentedControl options={options} value={value ?? undefined} onChange={onChange} />
      )}
      {/* Fixed two-line area (h-8 / leading-4) so option changes never reflow. */}
      <div className="mt-1.5 h-8 overflow-hidden text-xs leading-4 text-theme-text-tertiary">
        {selectedDescription}
      </div>
    </div>
  );
}

export default SegmentedField;
