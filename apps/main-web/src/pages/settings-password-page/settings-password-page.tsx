// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { webAuthClient } from "../../api/web-api-client.js";
import { PASSWORD_ERROR_TEXT_IDS } from "../../constants.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../../forms/shared/styles.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import { findPasswordFieldError } from "./find-password-field-error.js";
import type { PasswordChangeStatus, PasswordFieldErrors, PasswordFormValues } from "./types.js";

const EMPTY_VALUES: PasswordFormValues = { currentPassword: "", newPassword: "", confirmation: "" };

export const SettingsPasswordPage = () => {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<PasswordFieldErrors>({});
  const [status, setStatus] = useState<PasswordChangeStatus>("idle");

  const updateValue = (field: keyof PasswordFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
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
        <TextField
          data-testid="settings-password-current"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) => updateValue("currentPassword", event.target.value)}
          label={<Text variant="label" textId="settings.currentPasswordLabel" />}
          error={
            errors.currentPassword === undefined ? undefined : (
              <Text variant="error" textId={errors.currentPassword} />
            )
          }
        />
        <TextField
          data-testid="settings-password-new"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(event) => updateValue("newPassword", event.target.value)}
          label={<Text variant="label" textId="settings.newPasswordLabel" />}
          error={
            errors.newPassword === undefined ? undefined : (
              <Text variant="error" textId={errors.newPassword} />
            )
          }
        />
        <TextField
          data-testid="settings-password-confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          value={values.confirmation}
          onChange={(event) => updateValue("confirmation", event.target.value)}
          label={<Text variant="label" textId="settings.confirmPasswordLabel" />}
          error={
            errors.confirmation === undefined ? undefined : (
              <Text variant="error" textId={errors.confirmation} />
            )
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
