// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { ACCENT_IDS, type AccentId } from "../../constants.js";
import type { AccentPickerProps } from "./types.js";
import {
  accentIconTile,
  accentPickerStyle,
  accentPreviewStyle,
  accentRowStyle,
  accentSwatch,
  accentSwatchesStyle,
} from "./styles.js";

const ACCENT_LABEL_TEXT_IDS = {
  blue: "families.accentBlue",
  sage: "families.accentSage",
  terracotta: "families.accentTerracotta",
  lilac: "families.accentLilac",
} as const satisfies Record<AccentId, string>;

export const AccentPicker = ({ value, onChange }: AccentPickerProps) => {
  const { t } = useTranslation();

  return (
    <section style={accentPickerStyle} aria-labelledby="accent-picker-heading">
      <Text variant="label" id="accent-picker-heading" textId="families.accentHeading" />
      <div style={accentRowStyle}>
        <div style={accentPreviewStyle}>
          <div style={accentIconTile(value)}>
            <MaterialIcon name="cottage" size="20px" color="currentColor" />
          </div>
          <div>
            <Text variant="label" textId="families.accentPreviewName" />
            <Text variant="caption" textId="families.accentPreviewDescription" />
          </div>
        </div>
        <div style={accentSwatchesStyle}>
          {ACCENT_IDS.map((accent) => (
            <Button
              key={accent}
              variant="ghost"
              aria-label={t(ACCENT_LABEL_TEXT_IDS[accent])}
              aria-pressed={value === accent}
              data-testid={`family-space-accent-${accent}`}
              onClick={() => onChange(accent)}
            >
              <span style={accentSwatch(accent, value === accent)} />
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
