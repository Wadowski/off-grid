// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../../../media/use-is-narrow.js";
import { findPasswordStrengthFraction } from "../../find-password-strength-fraction.js";
import { findPasswordStrengthTextId } from "../../find-password-strength-text-id.js";
import { barStyle, barsStyle, hintStyle, strengthBarsStyle } from "./styles.js";
import type { PasswordStrengthBarsProps } from "./types.js";

const segmentCount = (narrow: boolean): number => (narrow ? 3 : 4);

export const PasswordStrengthBars = ({ password }: PasswordStrengthBarsProps) => {
  const narrow = useIsNarrow();
  const segments = segmentCount(narrow);
  const textId = findPasswordStrengthTextId(password);
  const strong = textId === "createAccount.strength.strong";
  const filled =
    password.length === 0
      ? 0
      : strong
        ? segments
        : Math.max(1, Math.floor(findPasswordStrengthFraction(password) * segments));

  return (
    <div style={strengthBarsStyle}>
      <div style={barsStyle(segments)} aria-hidden="true">
        {Array.from({ length: segments }, (_, index) => (
          <span key={index} style={barStyle(index < filled, strong)} />
        ))}
      </div>
      <div style={hintStyle}>
        <MaterialIcon name="info" size="15px" color="var(--og-color-outline)" />
        <Text variant="status" textId="createAccount.passwordHint" />
      </div>
    </div>
  );
};
