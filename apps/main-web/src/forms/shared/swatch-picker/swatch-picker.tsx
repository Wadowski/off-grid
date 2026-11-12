// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { pickerSectionStyle } from "../styles.js";
import type { SwatchPickerProps } from "./types.js";
import { swatchStyle, swatchesStyle } from "./styles.js";

export const SwatchPicker = <T extends string>({
  headingId,
  headingTextId,
  options,
  value,
  onChange,
  labelTextIds,
  backgroundOf,
  testIdPrefix,
}: SwatchPickerProps<T>) => {
  const { t } = useTranslation();

  return (
    <section style={pickerSectionStyle} aria-labelledby={headingId}>
      <Text variant="label" id={headingId} textId={headingTextId} />
      <div style={swatchesStyle}>
        {options.map((option) => (
          <Button
            key={option}
            variant="ghost"
            aria-label={t(labelTextIds[option])}
            aria-pressed={value === option}
            data-testid={`${testIdPrefix}-${option}`}
            onClick={() => onChange(option)}
          >
            <span style={swatchStyle(backgroundOf(option), value === option)} />
          </Button>
        ))}
      </div>
    </section>
  );
};
