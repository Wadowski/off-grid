// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Radio, Text, VisuallyHidden } from "@offgrid/ui";
import { adminFieldsetStyle, adminOptionGridStyle } from "../../../admin-page/styles.js";
import type { AdminRadioGroupProps } from "./types.js";

export const AdminRadioGroup = <Value extends string>({
  name,
  legendTextId,
  options,
  value,
  onChange,
}: AdminRadioGroupProps<Value>) => (
  <fieldset style={adminFieldsetStyle}>
    <legend>
      <VisuallyHidden>
        <Text variant="label" textId={legendTextId} />
      </VisuallyHidden>
    </legend>
    <div style={adminOptionGridStyle}>
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          label={<Text variant="label" textId={option.labelTextId} />}
        />
      ))}
    </div>
  </fieldset>
);
