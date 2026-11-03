// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { SignInLink } from "../../session/components/sign-in-link/sign-in-link.js";
import { PasswordField } from "./components/password-field/password-field.js";
import { PasswordStrengthMeter } from "./components/password-strength-meter/password-strength-meter.js";
import { mapRegisterError } from "./map-register-error.js";
import { createAccountFormStyle, signInPromptStyle } from "./styles.js";
import type {
  CreateAccountFieldErrors,
  CreateAccountFormProps,
  CreateAccountStatus,
  CreateAccountValues,
} from "./types.js";
import { validateCreateAccount } from "./validate-create-account.js";

const NO_FIELD_ERRORS: CreateAccountFieldErrors = {
  displayName: undefined,
  email: undefined,
  password: undefined,
  confirmation: undefined,
};

export const CreateAccountForm = ({ onCreated, onRegistrationClosed }: CreateAccountFormProps) => {
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

  const updateValue = (field: keyof CreateAccountValues) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fieldErrors = validateCreateAccount(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some((textId) => textId !== undefined)) {
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
    <div style={createAccountFormStyle}>
      <form data-testid="create-account-form" onSubmit={handleSubmit} noValidate>
        <div style={createAccountFormStyle}>
          <TextField
            data-testid="create-account-name"
            name="name"
            autoComplete="name"
            value={values.displayName}
            onChange={(event) => updateValue("displayName")(event.target.value)}
            label={<Text variant="label" textId="createAccount.nameLabel" />}
            error={
              errors.displayName === undefined ? undefined : (
                <Text variant="error" textId={errors.displayName} />
              )
            }
          />
          <TextField
            data-testid="create-account-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateValue("email")(event.target.value)}
            label={<Text variant="label" textId="createAccount.emailLabel" />}
            error={
              errors.email === undefined ? undefined : (
                <Text variant="error" textId={errors.email} />
              )
            }
          />
          <PasswordField
            testId="create-account-password"
            name="password"
            labelTextId="createAccount.passwordLabel"
            value={values.password}
            onChange={updateValue("password")}
            errorTextId={errors.password}
            visible={passwordVisible}
            onToggleVisible={() => setPasswordVisible((visible) => !visible)}
          />
          <PasswordStrengthMeter password={values.password} />
          <PasswordField
            testId="create-account-confirmation"
            name="confirmation"
            labelTextId="createAccount.confirmLabel"
            value={values.confirmation}
            onChange={updateValue("confirmation")}
            errorTextId={errors.confirmation}
            visible={confirmationVisible}
            onToggleVisible={() => setConfirmationVisible((visible) => !visible)}
          />
        </div>
        <Button
          type="submit"
          data-testid="create-account-submit"
          disabled={status === "submitting"}
        >
          <Text
            variant="action"
            textId={status === "submitting" ? "createAccount.submitting" : "createAccount.submit"}
          />
        </Button>
      </form>
      {status === "failed" && (
        <div role="alert" data-testid="create-account-status">
          <Text variant="error" textId="createAccount.createFailed" />
        </div>
      )}
      <div style={signInPromptStyle}>
        <Text variant="body" textId="createAccount.signInPrompt" />
        <SignInLink />
      </div>
    </div>
  );
};
