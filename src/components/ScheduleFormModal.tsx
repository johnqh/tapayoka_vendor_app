import { useState, useEffect } from 'react';
import {
  FormField,
  Text,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import type { DailySchedule, DayOfWeek } from '@sudobility/tapayoka_types';
import {
  getAvailableScheduleDays,
  makeDefaultDailySchedule,
  canSaveDailySchedule,
} from '@sudobility/tapayoka_lib';

interface ScheduleFormModalProps {
  open: boolean;
  /** The entry being edited, or null to add a new day. */
  entry: DailySchedule | null;
  /** Days already scheduled — excluded from the day picker when adding. */
  usedDays: DayOfWeek[];
  onClose: () => void;
  onSave: (entry: DailySchedule) => void | Promise<void>;
}

/** Add or edit a single day's open hours for an offering's schedule. */
export function ScheduleFormModal({
  open,
  entry,
  usedDays,
  onClose,
  onSave,
}: ScheduleFormModalProps) {
  const [draft, setDraft] = useState<DailySchedule | null>(null);
  const [saving, setSaving] = useState(false);

  const availableDays = getAvailableScheduleDays(usedDays);

  useEffect(() => {
    if (!open) return;
    setDraft(entry ?? makeDefaultDailySchedule(usedDays));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry]);

  if (!draft) return null;

  const canSave = canSaveDailySchedule(draft);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={open}
      title={entry ? 'Edit day' : 'Add day'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      canSave={canSave}
      size="small"
    >
      <div className="space-y-4">
        <div>
          <Text as="label" size="sm" weight="medium" className="block mb-1">
            Day
          </Text>
          {entry ? (
            <Text weight="medium">{draft.dayOfWeek}</Text>
          ) : (
            <Select
              value={draft.dayOfWeek}
              onValueChange={(value) => setDraft({ ...draft, dayOfWeek: value as DayOfWeek })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-end gap-3">
          <FormField
            id="schedule-start"
            label="Opens"
            value={draft.startTime}
            onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
            placeholder="09:00"
            maxLength={5}
          />
          <FormField
            id="schedule-end"
            label="Closes"
            value={draft.endTime}
            onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
            placeholder="17:00"
            maxLength={5}
          />
        </div>
      </div>
    </FormModal>
  );
}

export default ScheduleFormModal;
