// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { PasswordField } from "../create-account-form/components/password-field/password-field.js";
import { PasswordStrengthBars } from "../create-account-form/components/password-strength-bars/password-strength-bars.js";
import { PasswordStrengthLabel } from "../create-account-form/components/password-strength-label/password-strength-label.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../shared/styles.js";
import { mapResetError } from "./map-reset-error.js";
import { submitReset } from "./submit-reset.js";
import type {
  ResetPasswordFieldErrors,
  ResetPasswordFormProps,
  ResetPasswordStatus,
  ResetPasswordValues,
} from "./types.js";
import { validateResetPassword } from "./validate-reset-password.js";

const NO_RESET_ERRORS: ResetPasswordFieldErrors = {
  code: undefined,
  password: undefined,
  confirmation: undefined,
};

export const ResetPasswordForm = ({ email, method, onRecovered }: ResetPasswordFormProps) => {
  const [values, setValues] = useState<ResetPasswordValues>({
    code: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState<ResetPasswordFieldErrors>(NO_RESET_ERRORS);
  const [status, setStatus] = useState<ResetPasswordStatus>("idle");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationMatches =
    values.confirmation.length > 0 && values.confirmation === values.password;

  const updateValue = (field: keyof ResetPasswordValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }
    const fieldErrors = validateResetPassword(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some((textId) => textId !== undefined)) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    try {
      const issued = await submitReset(method, email, values.code.trim(), values.password);
      onRecovered(issued.recoveryCode);
    } catch (error) {
      const failure = mapResetError(error);
      setStatus("idle");
      if (failure.kind === "codeInvalid") {
        setErrors({ ...NO_RESET_ERRORS, code: "resetPassword.codeInvalid" });
      } else if (failure.kind === "password") {
        setErrors({ ...NO_RESET_ERRORS, password: failure.textId });
      } else {
        setStatus(failure.kind);
      }
    }
  };

  return (
    <form data-testid="reset-password-form" onSubmit={handleSubmit} noValidate style={formStyle}>
      <TextField
        data-testid="reset-password-code"
        name="code"
        autoComplete="one-time-code"
        mono
        value={values.code}
        onChange={(event) => updateValue("code", event.target.value)}
        label={
          <Text
            variant="label"
            textId={
              method === "recoveryCode"
                ? "resetPassword.recoveryCodeLabel"
                : "resetPassword.emailCodeLabel"
            }
          />
        }
        leading={<MaterialIcon name="pin" size="18px" color="var(--og-color-outline)" />}
        error={
          errors.code === undefined ? undefined : <Text variant="error" textId={errors.code} />
        }
      />
      <PasswordField
        testId="reset-password-password"
        name="password"
        labelTextId="createAccount.passwordLabel"
        icon="key"
        value={values.password}
        onChange={(value) => updateValue("password", value)}
        errorTextId={errors.password}
        visible={passwordVisible}
        onToggleVisible={() => setPasswordVisible((visible) => !visible)}
        labelAside={<PasswordStrengthLabel password={values.password} />}
        footer={<PasswordStrengthBars password={values.password} />}
      />
      <PasswordField
        testId="reset-password-confirmation"
        name="confirmation"
        labelTextId="createAccount.confirmLabel"
        icon="lock"
        value={values.confirmation}
        onChange={(value) => updateValue("confirmation", value)}
        errorTextId={errors.confirmation}
        visible={confirmationVisible}
        onToggleVisible={() => setConfirmationVisible((visible) => !visible)}
        trailingStatus={
          confirmationMatches ? (
            <MaterialIcon name="check_circle" size="18px" color="var(--og-color-good)" filled />
          ) : undefined
        }
      />
      <div style={actionBlockStyle}>
        <Button
          type="submit"
          data-testid="reset-password-submit"
          disabled={status === "submitting"}
        >
          <Text
            variant="action"
            textId={status === "submitting" ? "resetPassword.submitting" : "resetPassword.submit"}
          />
          <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
        </Button>
      </div>
      {(status === "locked" || status === "failed") && (
        <div role="alert" data-testid="reset-password-status" style={errorBannerStyle}>
          <Text
            variant="error"
            textId={status === "locked" ? "resetPassword.locked" : "resetPassword.failed"}
          />
        </div>
      )}
    </form>
  );
};
