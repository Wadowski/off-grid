// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { webAuthClient } from "../../api/web-api-client.js";
import { PASSWORD_ERROR_TEXT_IDS } from "../../constants.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../../forms/shared/styles.js";
import { PasswordField } from "../../forms/create-account-form/components/password-field/password-field.js";
import { PasswordStrengthBars } from "../../forms/create-account-form/components/password-strength-bars/password-strength-bars.js";
import { PasswordStrengthLabel } from "../../forms/create-account-form/components/password-strength-label/password-strength-label.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { findPasswordFieldError } from "./find-password-field-error.js";
import type {
  PasswordChangeStatus,
  PasswordFieldErrors,
  PasswordFormValues,
  PasswordVisibility,
} from "./types.js";

const EMPTY_VALUES: PasswordFormValues = { currentPassword: "", newPassword: "", confirmation: "" };
const HIDDEN: PasswordVisibility = {
  currentPassword: false,
  newPassword: false,
  confirmation: false,
};

export const SettingsPasswordPage = () => {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<PasswordFieldErrors>({});
  const [visible, setVisible] = useState<PasswordVisibility>(HIDDEN);
  const [status, setStatus] = useState<PasswordChangeStatus>("idle");
  const confirmationMatches =
    values.confirmation.length > 0 && values.confirmation === values.newPassword;

  const updateValue = (field: keyof PasswordFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const toggleVisible = (field: keyof PasswordFormValues) => {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  };

  const failWithServerError = (error: unknown) => {
    setStatus("failed");
    if (!(error instanceof ApiError)) {
      return;
    }
    if (error.code === "CURRENT_PASSWORD_INCORRECT") {
      setErrors({ currentPassword: "settings.currentPasswordIncorrect" });
    }
    const passwordTextId = PASSWORD_ERROR_TEXT_IDS.get(error.code);
    if (passwordTextId !== undefined) {
      setErrors({ newPassword: passwordTextId });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const localErrors = findPasswordFieldError(values);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    try {
      await webAuthClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setValues(EMPTY_VALUES);
      setStatus("changed");
    } catch (error) {
      failWithServerError(error);
    }
  };

  return (
    <SettingsSubpage titleTextId="settings.passwordLabel">
      <form
        data-testid="settings-password-form"
        onSubmit={handleSubmit}
        noValidate
        style={formStyle}
      >
        <PasswordField
          testId="settings-password-current"
          name="currentPassword"
          labelTextId="settings.currentPasswordLabel"
          icon="lock"
          value={values.currentPassword}
          onChange={(value) => updateValue("currentPassword", value)}
          errorTextId={errors.currentPassword}
          visible={visible.currentPassword}
          onToggleVisible={() => toggleVisible("currentPassword")}
          autoComplete="current-password"
        />
        <PasswordField
          testId="settings-password-new"
          name="newPassword"
          labelTextId="settings.newPasswordLabel"
          icon="key"
          value={values.newPassword}
          onChange={(value) => updateValue("newPassword", value)}
          errorTextId={errors.newPassword}
          visible={visible.newPassword}
          onToggleVisible={() => toggleVisible("newPassword")}
          labelAside={<PasswordStrengthLabel password={values.newPassword} />}
          footer={<PasswordStrengthBars password={values.newPassword} />}
        />
        <PasswordField
          testId="settings-password-confirmation"
          name="confirmation"
          labelTextId="settings.confirmPasswordLabel"
          icon="lock_reset"
          value={values.confirmation}
          onChange={(value) => updateValue("confirmation", value)}
          errorTextId={errors.confirmation}
          visible={visible.confirmation}
          onToggleVisible={() => toggleVisible("confirmation")}
          trailingStatus={
            confirmationMatches ? (
              <MaterialIcon name="check_circle" size="18px" color="var(--og-color-good)" filled />
            ) : undefined
          }
        />
        <div style={actionBlockStyle}>
          <Button type="submit" data-testid="settings-password-save" disabled={status === "saving"}>
            <Text
              variant="action"
              textId={status === "saving" ? "settings.saving" : "settings.save"}
            />
          </Button>
          <div role="status" style={errorBannerStyle}>
            {status === "changed" && (
              <>
                <Text variant="status" textId="settings.passwordChanged" />
                <Text variant="status" textId="settings.passwordChangedNote" />
              </>
            )}
            {status === "failed" && <Text variant="error" textId="settings.failed" />}
          </div>
        </div>
      </form>
    </SettingsSubpage>
  );
};
