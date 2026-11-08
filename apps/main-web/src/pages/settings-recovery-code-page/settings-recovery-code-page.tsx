// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ApiError } from "@offgrid/api-client";
import { Button, Text, TextField } from "@offgrid/ui";
import type { FormEvent } from "react";
import { useState } from "react";
import { webAuthClient } from "../../api/web-api-client.js";
import { RecoveryCodeActions } from "../create-account-page/components/recovery-code-actions/recovery-code-actions.js";
import { actionBlockStyle, errorBannerStyle, formStyle } from "../../forms/shared/styles.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";

export const SettingsRecoveryCodePage = () => {
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState<string>();
  const [status, setStatus] = useState<"idle" | "saving" | "failed">("idle");
  const [passwordIncorrect, setPasswordIncorrect] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setPasswordIncorrect(false);
    try {
      const issued = await webAuthClient.regenerateRecoveryCode({ password });
      setPassword("");
      setRecoveryCode(issued.recoveryCode);
      setStatus("idle");
    } catch (error) {
      setStatus("failed");
      setPasswordIncorrect(error instanceof ApiError && error.code === "PASSWORD_INCORRECT");
    }
  };

  return (
    <SettingsSubpage titleTextId="settings.recoveryLabel">
      <Text variant="body" textId="settings.recoveryBody" />
      <form
        data-testid="settings-recovery-form"
        onSubmit={handleSubmit}
        noValidate
        style={formStyle}
      >
        <TextField
          data-testid="settings-recovery-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          label={<Text variant="label" textId="settings.recoveryConfirmPassword" />}
          error={
            passwordIncorrect ? (
              <Text variant="error" textId="settings.currentPasswordIncorrect" />
            ) : undefined
          }
        />
        <div style={actionBlockStyle}>
          <Button
            type="submit"
            data-testid="settings-recovery-generate"
            disabled={status === "saving"}
          >
            <Text variant="action" textId="settings.recoveryGenerate" />
          </Button>
          <div role="status" style={errorBannerStyle}>
            {status === "failed" && !passwordIncorrect && (
              <Text variant="error" textId="settings.failed" />
            )}
          </div>
        </div>
      </form>
      {recoveryCode !== undefined && (
        <div>
          <Text variant="status" textId="settings.recoveryGenerated" />
          <Text variant="label" value={recoveryCode} />
          <RecoveryCodeActions recoveryCode={recoveryCode} />
        </div>
      )}
    </SettingsSubpage>
  );
};
