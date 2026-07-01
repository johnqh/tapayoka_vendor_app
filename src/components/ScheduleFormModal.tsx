import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalFooter,
  Button,
  FormField,
  Text,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sudobility/components';
import type { DailySchedule, DayOfWeek } from '@sudobility/tapayoka_types';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

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

  const availableDays = DAYS_OF_WEEK.filter((d) => !usedDays.includes(d));

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setDraft(entry);
    } else {
      setDraft({
        dayOfWeek: availableDays[0] ?? 'Monday',
        startTime: '09:00',
        endTime: '17:00',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry]);

  if (!draft) return null;

  const canSave = !!draft.dayOfWeek && !!draft.startTime.trim() && !!draft.endTime.trim();

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
    <Modal isOpen={open} onClose={onClose} title={entry ? 'Edit day' : 'Add day'} size="small">
      <ModalContent variant="scrollable">
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
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !canSave}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ScheduleFormModal;
