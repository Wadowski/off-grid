// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { methodChoiceStyle, methodLegendStyle } from "../../styles.js";
import { RecoveryMethodOption } from "../recovery-method-option/recovery-method-option.js";
import type { RecoveryMethodChoiceProps } from "./types.js";

export const RecoveryMethodChoice = ({ method, onSelect }: RecoveryMethodChoiceProps) => (
  <fieldset style={methodChoiceStyle} data-testid="forgot-password-methods">
    <legend style={methodLegendStyle}>
      <Text variant="label" textId="forgotPassword.methodLegend" />
    </legend>
    <RecoveryMethodOption
      method="recoveryCode"
      selected={method === "recoveryCode"}
      onSelect={onSelect}
      labelTextId="forgotPassword.methodRecoveryCode"
      hintTextId="forgotPassword.methodRecoveryCodeHint"
    />
    <RecoveryMethodOption
      method="emailCode"
      selected={method === "emailCode"}
      onSelect={onSelect}
      labelTextId="forgotPassword.methodEmailCode"
      hintTextId="forgotPassword.methodEmailCodeHint"
    />
  </fieldset>
);
