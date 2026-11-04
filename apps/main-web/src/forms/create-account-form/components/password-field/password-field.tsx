// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { FormField } from "../form-field/form-field.js";
import { visibilityToggleStyle } from "./styles.js";
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
}: PasswordFieldProps) => {
  const { t } = useTranslation();
  const toggleLabel = t(visible ? "createAccount.hidePassword" : "createAccount.showPassword");
  const eyeToggle = (
    <button
      type="button"
      data-testid={`${testId}-toggle`}
      aria-label={toggleLabel}
      onClick={onToggleVisible}
      style={visibilityToggleStyle}
    >
      <MaterialIcon
        name={visible ? "visibility_off" : "visibility"}
        size="18px"
        color="var(--og-color-outline)"
      />
    </button>
  );

  return (
    <FormField
      testId={testId}
      name={name}
      labelTextId={labelTextId}
      icon={icon}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      autoComplete="new-password"
      mono
      errorTextId={errorTextId}
      trailing={
        <>
          {trailingStatus}
          {eyeToggle}
        </>
      }
      trailingInset="action"
      labelAside={labelAside}
      footer={footer}
    />
  );
};
