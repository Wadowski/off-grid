// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { findPasswordStrengthTextId } from "../../find-password-strength-text-id.js";
import { strengthLabelStyle } from "./styles.js";
import type { PasswordStrengthLabelProps } from "./types.js";

export const PasswordStrengthLabel = ({ password }: PasswordStrengthLabelProps) => {
  const textId = findPasswordStrengthTextId(password);
  if (textId === undefined) {
    return null;
  }
  const strong = textId === "createAccount.strength.strong";

  return (
    <span role="status" style={strengthLabelStyle(strong)}>
      <MaterialIcon
        name={strong ? "check_circle" : "info"}
        size="14px"
        color="currentColor"
        filled={strong}
      />
      <Text variant="caption" textId={textId} />
    </span>
  );
};
