// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Checkbox, Text, TextField } from "@offgrid/ui";
import type { FormEvent, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { signIn } from "../../session/sign-in.js";
import { PasswordField } from "../create-account-form/components/password-field/password-field.js";
import { mapSignInError } from "./map-sign-in-error.js";
import { formStyle, statusStyle, submitBlockStyle } from "./styles.js";
import type {
  SignInFailureTextId,
  SignInFieldErrors,
  SignInStatus,
  SignInValues,
} from "./types.js";
import { validateSignIn } from "./validate-sign-in.js";

const NO_ERRORS: SignInFieldErrors = { email: undefined, password: undefined };

const FAILURE_TEXT_IDS: Partial<Record<SignInStatus, SignInFailureTextId>> = {
  invalidCredentials: "signIn.invalidCredentials",
  unreachable: "signIn.unreachable",
  failed: "signIn.failed",
};

export const SignInForm = () => {
  const [values, setValues] = useState<SignInValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<SignInFieldErrors>(NO_ERRORS);
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const requestInFlight = useRef(false);

  const updateValue = (field: keyof SignInValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const updateCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState("CapsLock"));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestInFlight.current) {
      return;
    }
    const email = values.email.trim();
    const fieldErrors = validateSignIn({ email, password: values.password });
    setErrors(fieldErrors);
    if (fieldErrors.email !== undefined || fieldErrors.password !== undefined) {
      return;
    }
    requestInFlight.current = true;
    setStatus("submitting");
    try {
      await signIn({ email, password: values.password, rememberMe });
    } catch (error) {
      requestInFlight.current = false;
      const failure = mapSignInError(error);
      if (failure.kind === "invalidCredentials") {
        setValues((current) => ({ ...current, password: "" }));
      }
      setStatus(failure.kind);
    }
  };

  return (
    <form data-testid="sign-in-form" onSubmit={handleSubmit} noValidate style={formStyle}>
      <TextField
        data-testid="sign-in-email"
        name="email"
        type="email"
        autoComplete="username"
        value={values.email}
        onChange={(event) => updateValue("email", event.target.value)}
        label={<Text variant="label" textId="signIn.emailLabel" />}
        leading={
          <MaterialIcon name="alternate_email" size="18px" color="var(--og-color-outline)" />
        }
        error={
          errors.email === undefined ? undefined : <Text variant="error" textId={errors.email} />
        }
      />
      <PasswordField
        testId="sign-in-password"
        name="password"
        labelTextId="signIn.passwordLabel"
        icon="key"
        autoComplete="current-password"
        value={values.password}
        onChange={(value) => updateValue("password", value)}
        errorTextId={errors.password}
        visible={passwordVisible}
        onToggleVisible={() => setPasswordVisible((visible) => !visible)}
        onKeyDown={updateCapsLock}
        onKeyUp={updateCapsLock}
        footer={
          capsLockOn ? (
            <div role="status" style={statusStyle}>
              <Text variant="status" textId="signIn.capsLock" />
            </div>
          ) : undefined
        }
      />
      <Checkbox
        data-testid="sign-in-remember-me"
        label={<Text variant="body" textId="signIn.rememberMe" />}
        checked={rememberMe}
        onChange={(event) => setRememberMe(event.target.checked)}
      />
      <div style={submitBlockStyle}>
        <Button type="submit" data-testid="sign-in-submit" disabled={status === "submitting"}>
          <Text
            variant="action"
            textId={status === "submitting" ? "signIn.submitting" : "signIn.submit"}
          />
          <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
        </Button>
      </div>
      {FAILURE_TEXT_IDS[status] !== undefined && (
        <div role="alert" data-testid="sign-in-status">
          <Text variant="error" textId={FAILURE_TEXT_IDS[status]} />
        </div>
      )}
    </form>
  );
};
