// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import { NO_FIELD_ERRORS } from "../../constants.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { SignInLink } from "../../session/components/sign-in-link/sign-in-link.js";
import { FormField } from "./components/form-field/form-field.js";
import { PasswordField } from "./components/password-field/password-field.js";
import { PasswordStrengthBars } from "./components/password-strength-bars/password-strength-bars.js";
import { PasswordStrengthLabel } from "./components/password-strength-label/password-strength-label.js";
import { TipNote } from "./components/tip-note/tip-note.js";
import { mapRegisterError } from "./map-register-error.js";
import {
  errorBannerStyle,
  formStyle,
  nameEmailRowStyle,
  signInPromptStyle,
  submitBlockStyle,
} from "./styles.js";
import type {
  CreateAccountFieldErrors,
  CreateAccountFormProps,
  CreateAccountStatus,
  CreateAccountValues,
} from "./types.js";
import { validateCreateAccount } from "./validate-create-account.js";

export const CreateAccountForm = ({ onCreated, onRegistrationClosed }: CreateAccountFormProps) => {
  const narrow = useIsNarrow();
  const [values, setValues] = useState<CreateAccountValues>({
    displayName: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState<CreateAccountFieldErrors>(NO_FIELD_ERRORS);
  const [status, setStatus] = useState<CreateAccountStatus>("idle");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const confirmationMatches =
    values.confirmation.length > 0 && values.confirmation === values.password;

  const updateValue = (field: keyof CreateAccountValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fieldErrors = validateCreateAccount(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some((textId) => textId !== undefined)) {
      setStatus("idle");
      return;
    }
    setStatus("submitting");
    try {
      const account = await anonymousAuthClient.register({
        displayName: values.displayName.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      onCreated(account.recoveryCode);
    } catch (error) {
      const failure = mapRegisterError(error);
      setStatus("idle");
      if (failure.kind === "registrationClosed") {
        onRegistrationClosed();
      } else if (failure.kind === "field") {
        setErrors({ ...NO_FIELD_ERRORS, [failure.field]: failure.textId });
      } else {
        setStatus("failed");
      }
    }
  };

  return (
    <form
      data-testid="create-account-form"
      onSubmit={handleSubmit}
      noValidate
      style={formStyle(narrow)}
    >
      <div style={nameEmailRowStyle(narrow)}>
        <FormField
          testId="create-account-name"
          name="name"
          labelTextId="createAccount.nameLabel"
          icon="badge"
          type="text"
          value={values.displayName}
          onChange={(value) => updateValue("displayName", value)}
          autoComplete="name"
          errorTextId={errors.displayName}
        />
        <FormField
          testId="create-account-email"
          name="email"
          labelTextId="createAccount.emailLabel"
          icon="alternate_email"
          type="email"
          value={values.email}
          onChange={(value) => updateValue("email", value)}
          autoComplete="email"
          errorTextId={errors.email}
        />
      </div>
      <PasswordField
        testId="create-account-password"
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
        testId="create-account-confirmation"
        name="confirmation"
        labelTextId="createAccount.confirmLabel"
        icon="lock_reset"
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
      {!narrow && <TipNote />}
      <div style={submitBlockStyle}>
        <Button
          type="submit"
          data-testid="create-account-submit"
          disabled={status === "submitting"}
        >
          <Text
            variant="action"
            textId={status === "submitting" ? "createAccount.submitting" : "createAccount.submit"}
          />
          <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
        </Button>
        <div style={signInPromptStyle}>
          <Text variant="status" textId="createAccount.signInPrompt" />
          <SignInLink />
        </div>
      </div>
      {status === "failed" && (
        <div role="alert" data-testid="create-account-status" style={errorBannerStyle}>
          <Text variant="error" textId="createAccount.createFailed" />
        </div>
      )}
    </form>
  );
};
