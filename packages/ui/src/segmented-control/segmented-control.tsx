// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import {
  segmentedControlStyle,
  segmentedOptionBaseStyle,
  segmentedOptionSelectedStyle,
} from "./styles.js";
import type { SegmentedControlProps, Translate } from "./types.js";

export const SegmentedControl = <Value extends string>({
  label,
  labelTextId,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) => {
  const { t } = useTranslation();
  const translate = t as unknown as Translate;

  return (
    <div
      role="group"
      aria-label={labelTextId === undefined ? label : translate(labelTextId)}
      style={segmentedControlStyle}
    >
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
            {option.labelTextId === undefined ? option.label : translate(option.labelTextId)}
          </button>
        );
      })}
    </div>
  );
};
