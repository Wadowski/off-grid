// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import type { PasswordFieldProps } from "./types.js";

export const PasswordField = ({
  testId,
  name,
  labelTextId,
  icon,
  value,
  onChange,
  errorTextId,
  visible,
  onToggleVisible,
  labelAside,
  footer,
  trailingStatus,
  autoComplete = "new-password",
  onKeyDown,
  onKeyUp,
}: PasswordFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      data-testid={testId}
      name={name}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      mono
      label={<Text variant="label" textId={labelTextId} />}
      leading={<MaterialIcon name={icon} size="18px" color="var(--og-color-outline)" />}
      trailing={
        <>
          {trailingStatus}
          <Button
            variant="ghost"
            data-testid={`${testId}-toggle`}
            aria-label={t(visible ? "createAccount.hidePassword" : "createAccount.showPassword")}
            onClick={onToggleVisible}
          >
            <MaterialIcon
              name={visible ? "visibility_off" : "visibility"}
              size="18px"
              color="currentColor"
            />
          </Button>
        </>
      }
      error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
      labelAside={labelAside}
      footer={footer}
    />
  );
};
