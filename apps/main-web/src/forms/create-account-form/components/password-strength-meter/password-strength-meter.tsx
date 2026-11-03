// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { findPasswordStrengthFraction } from "../../find-password-strength-fraction.js";
import { findPasswordStrengthTextId } from "../../find-password-strength-text-id.js";
import { meterFillStyle, meterStyle, meterTrackStyle } from "./styles.js";
import type { PasswordStrengthMeterProps } from "./types.js";

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const textId = findPasswordStrengthTextId(password);

  return (
    <div style={meterStyle} data-testid="create-account-strength">
      <div aria-hidden="true" style={meterTrackStyle}>
        <div style={meterFillStyle(findPasswordStrengthFraction(password))} />
      </div>
      <div role="status">{textId !== undefined && <Text variant="status" textId={textId} />}</div>
    </div>
  );
};
