// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Radio, Text } from "@offgrid/ui";
import { methodOptionHintStyle, methodOptionStyle } from "../../styles.js";
import type { RecoveryMethodOptionProps } from "./types.js";

export const RecoveryMethodOption = ({
  method,
  selected,
  onSelect,
  labelTextId,
  hintTextId,
}: RecoveryMethodOptionProps) => (
  <div style={methodOptionStyle(selected)}>
    <Radio
      name="recovery-method"
      value={method}
      checked={selected}
      onChange={() => onSelect(method)}
      data-testid={`forgot-password-method-${method}`}
      label={
        <>
          <Text variant="label" textId={labelTextId} />
          <span style={methodOptionHintStyle}>
            <Text variant="status" textId={hintTextId} />
          </span>
        </>
      }
    />
  </div>
);
