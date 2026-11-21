"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Quantity",
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded border border-outline-variant/50 bg-surface-container-lowest p-0.5 shadow-sm"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="inline-flex h-10 w-10 items-center justify-center rounded text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-35"
      >
        <MinusIcon size={15} />
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="w-9 select-none text-center font-sans text-label-lg font-semibold tabular-nums text-on-surface"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="inline-flex h-10 w-10 items-center justify-center rounded text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-35"
      >
        <PlusIcon size={15} />
      </button>
    </div>
  );
}
