// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  segmentedControlStyle,
  segmentedOptionBaseStyle,
  segmentedOptionSelectedStyle,
} from "./styles.js";
import type { SegmentedControlProps } from "./types.js";

export const SegmentedControl = <Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) => (
  <div role="group" aria-label={label} style={segmentedControlStyle}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          className="og-focusable"
          aria-pressed={selected}
          data-testid={`segmented-option-${option.value}`}
          style={
            selected
              ? { ...segmentedOptionBaseStyle, ...segmentedOptionSelectedStyle }
              : segmentedOptionBaseStyle
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
