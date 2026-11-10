// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Radio, Text, cssVar } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { SPACE_PURPOSE_OPTIONS } from "../../constants.js";
import { pickerSectionStyle } from "../../styles.js";
import type { PurposePickerProps } from "./types.js";
import { purposeGroupStyle, purposeOptionStyle } from "./styles.js";

export const PurposePicker = ({ value, onChange }: PurposePickerProps) => (
  <section style={pickerSectionStyle} aria-labelledby="purpose-picker-heading">
    <Text variant="label" id="purpose-picker-heading" textId="families.purposeHeading" />
    <div role="radiogroup" aria-labelledby="purpose-picker-heading" style={purposeGroupStyle}>
      {SPACE_PURPOSE_OPTIONS.map((option) => (
        <Radio
          key={option.id}
          name="space-purpose"
          value={option.id}
          checked={value === option.id}
          onChange={() => onChange(option.id)}
          data-testid={`family-space-purpose-${option.id}`}
          label={
            <span style={purposeOptionStyle}>
              <MaterialIcon name={option.iconName} size="20px" color={cssVar("color-accent")} />
              <Text variant="label" textId={option.nameTextId} />
              <Text variant="caption" textId={option.descriptionTextId} />
            </span>
          }
        />
      ))}
    </div>
  </section>
);
