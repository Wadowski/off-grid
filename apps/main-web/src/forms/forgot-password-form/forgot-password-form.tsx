// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import type { RecoveryMethod } from "../../recovery/types.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../shared/styles.js";
import { RecoveryMethodChoice } from "./components/recovery-method-choice/recovery-method-choice.js";
import { findEmailError } from "./find-email-error.js";
import { mapCodeRequestError } from "./map-code-request-error.js";
import { helpStyle } from "./styles.js";
import type {
  ForgotPasswordEmailTextId,
  ForgotPasswordFailureTextId,
  ForgotPasswordFormProps,
  ForgotPasswordStatus,
} from "./types.js";

const FAILURE_TEXT_IDS: Partial<Record<ForgotPasswordStatus, ForgotPasswordFailureTextId>> = {
  failed: "forgotPassword.failed",
  emailNotConfigured: "forgotPassword.emailNotConfigured",
};

export const ForgotPasswordForm = ({ emailCodeAvailable }: ForgotPasswordFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<RecoveryMethod>("recoveryCode");
  const [emailError, setEmailError] = useState<ForgotPasswordEmailTextId | undefined>(undefined);
  const [status, setStatus] = useState<ForgotPasswordStatus>("idle");

  const continueToReset = () => {
    navigate("/reset-password", { state: { email: email.trim(), method } });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmailError = findEmailError(email);
    setEmailError(nextEmailError);
    if (nextEmailError !== undefined || status === "submitting") {
      return;
    }
    if (method === "recoveryCode") {
      continueToReset();
      return;
    }
    setStatus("submitting");
    try {
      await anonymousAuthClient.requestEmailCode({ email: email.trim() });
      continueToReset();
    } catch (error) {
      setStatus(mapCodeRequestError(error));
    }
  };

  return (
    <form data-testid="forgot-password-form" onSubmit={handleSubmit} noValidate style={formStyle}>
      <TextField
        data-testid="forgot-password-email"
        name="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        label={<Text variant="label" textId="forgotPassword.emailLabel" />}
        leading={
          <MaterialIcon name="alternate_email" size="18px" color="var(--og-color-outline)" />
        }
        error={emailError === undefined ? undefined : <Text variant="error" textId={emailError} />}
      />
      <RecoveryMethodChoice
        method={method}
        emailCodeAvailable={emailCodeAvailable}
        onSelect={setMethod}
      />
      <div style={actionBlockStyle}>
        <Button
          type="submit"
          data-testid="forgot-password-submit"
          disabled={status === "submitting"}
        >
          <Text
            variant="action"
            textId={status === "submitting" ? "forgotPassword.submitting" : "forgotPassword.submit"}
          />
          <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          data-testid="forgot-password-cancel"
          onClick={() => navigate("/sign-in")}
        >
          <Text variant="action" textId="forgotPassword.cancel" />
        </Button>
        <div style={helpStyle}>
          <Text variant="status" textId="forgotPassword.help" />
        </div>
      </div>
      {FAILURE_TEXT_IDS[status] !== undefined && (
        <div role="alert" data-testid="forgot-password-status" style={errorBannerStyle}>
          <Text variant="error" textId={FAILURE_TEXT_IDS[status]} />
        </div>
      )}
    </form>
  );
};
