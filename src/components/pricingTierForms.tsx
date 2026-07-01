import { Button, Input, Text } from '@sudobility/components';
import type {
  TimedPricingTier,
  FixedPricingTier,
  OfferingSignal,
  DurationUnit,
} from '@sudobility/tapayoka_types';
import { parseIntOr, addSignal, removeSignal, updateSignal } from '@sudobility/tapayoka_lib';

// UI-only: the duration units offered as toggle buttons in the tier forms.
const DURATION_UNITS: DurationUnit[] = ['minutes', 'hours'];

export function VariablePricingForm({
  config,
  onChange,
}: {
  config: TimedPricingTier;
  onChange: (c: TimedPricingTier) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Start with
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.startPrice}
            onChange={(e) => onChange({ ...config, startPrice: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <Text as="span" size="xs" color="muted">
            for
          </Text>
          <Input
            type="number"
            className="w-16"
            value={config.startDuration}
            onChange={(e) => onChange({ ...config, startDuration: parseIntOr(e.target.value, 1) })}
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map((u) => (
              <Button
                key={u}
                type="button"
                variant={config.startDurationUnit === u ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, startDurationUnit: u })}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Additional
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.marginalPrice}
            onChange={(e) => onChange({ ...config, marginalPrice: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <Text as="span" size="xs" color="muted">
            for
          </Text>
          <Input
            type="number"
            className="w-16"
            value={config.marginalDuration}
            onChange={(e) =>
              onChange({ ...config, marginalDuration: parseIntOr(e.target.value, 1) })
            }
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map((u) => (
              <Button
                key={u}
                type="button"
                variant={config.marginalDurationUnit === u ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, marginalDurationUnit: u })}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Pin Number (0–25)
        </Text>
        <Input
          type="number"
          className="w-16"
          value={config.pinNumber}
          min={0}
          max={25}
          onChange={(e) => onChange({ ...config, pinNumber: parseIntOr(e.target.value, 0) })}
        />
      </div>
    </div>
  );
}

export function FixedPricingForm({
  config,
  onChange,
}: {
  config: FixedPricingTier;
  onChange: (c: FixedPricingTier) => void;
}) {
  const handleAddSignal = () => onChange(addSignal(config));
  const handleRemoveSignal = (index: number) => onChange(removeSignal(config, index));
  const handleUpdateSignal = (index: number, signal: OfferingSignal) =>
    onChange(updateSignal(config, index, signal));

  return (
    <div className="space-y-3">
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Price
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.price}
            onChange={(e) => onChange({ ...config, price: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Signals
        </Text>
        {config.signals.map((signal, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Text as="span" size="xs" color="muted">
              Pin
            </Text>
            <Input
              type="number"
              className="w-14"
              value={signal.pinNumber}
              min={0}
              max={25}
              onChange={(e) =>
                handleUpdateSignal(index, {
                  ...signal,
                  pinNumber: parseIntOr(e.target.value, 0),
                })
              }
            />
            <Text as="span" size="xs" color="muted">
              Duration (s)
            </Text>
            <Input
              type="number"
              className="w-16"
              value={signal.duration}
              onChange={(e) =>
                handleUpdateSignal(index, {
                  ...signal,
                  duration: parseIntOr(e.target.value, 1),
                })
              }
            />
            <Button
              type="button"
              variant="destructive-outline"
              size="sm"
              onClick={() => handleRemoveSignal(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="link" size="sm" onClick={handleAddSignal}>
          + Add Signal
        </Button>
      </div>
    </div>
  );
}
