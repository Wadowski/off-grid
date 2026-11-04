// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import { passwordFieldStyle, toggleRowStyle } from "./styles.js";
import type { PasswordFieldProps } from "./types.js";

export const PasswordField = ({
  testId,
  name,
  labelTextId,
  value,
  onChange,
  errorTextId,
  visible,
  onToggleVisible,
}: PasswordFieldProps) => (
  <div style={passwordFieldStyle}>
    <TextField
      data-testid={testId}
      name={name}
      type={visible ? "text" : "password"}
      autoComplete="new-password"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={<Text variant="label" textId={labelTextId} />}
      error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
    />
    <div style={toggleRowStyle}>
      <Button variant="secondary" data-testid={`${testId}-toggle`} onClick={onToggleVisible}>
        <Text
          variant="action"
          textId={visible ? "createAccount.hidePassword" : "createAccount.showPassword"}
        />
      </Button>
    </div>
  </div>
);
