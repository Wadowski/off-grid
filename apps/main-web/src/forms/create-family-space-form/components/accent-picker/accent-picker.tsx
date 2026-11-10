// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  FAMILY_ACCENT_LABEL_TEXT_IDS,
  FAMILY_ACCENTS,
} from "../../../../families/family-appearance.js";
import { pickerSectionStyle } from "../../styles.js";
import type { AccentPickerProps } from "./types.js";
import { accentSwatch, accentSwatchesStyle } from "./styles.js";

export const AccentPicker = ({ value, onChange }: AccentPickerProps) => {
  const { t } = useTranslation();

  return (
    <section style={pickerSectionStyle} aria-labelledby="accent-picker-heading">
      <Text variant="label" id="accent-picker-heading" textId="families.accentHeading" />
      <div style={accentSwatchesStyle}>
        {FAMILY_ACCENTS.map((accent) => (
          <Button
            key={accent}
            variant="ghost"
            aria-label={t(FAMILY_ACCENT_LABEL_TEXT_IDS[accent])}
            aria-pressed={value === accent}
            data-testid={`family-space-accent-${accent}`}
            onClick={() => onChange(accent)}
          >
            <span style={accentSwatch(accent, value === accent)} />
          </Button>
        ))}
      </div>
    </section>
  );
};
