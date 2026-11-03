// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { completeRegistration } from "../../../../session/complete-registration.js";
import { RecoveryCodeActions } from "../recovery-code-actions/recovery-code-actions.js";
import { checkboxLabelStyle, recoveryCodeBoxStyle, recoveryCodeStepStyle } from "./styles.js";
import type { RecoveryCodeStepProps, RecoveryContinueStatus } from "./types.js";

export const RecoveryCodeStep = ({ recoveryCode }: RecoveryCodeStepProps) => {
  const [saved, setSaved] = useState(false);
  const [continueStatus, setContinueStatus] = useState<RecoveryContinueStatus>("idle");

  const handleContinue = async () => {
    setContinueStatus("submitting");
    try {
      await completeRegistration();
    } catch {
      setContinueStatus("failed");
    }
  };

  return (
    <div style={recoveryCodeStepStyle}>
      <Text variant="heading" textId="createAccount.recovery.heading" />
      <Text variant="body" textId="createAccount.recovery.explanation" />
      <div style={recoveryCodeBoxStyle}>
        <Text variant="subheading" value={recoveryCode} data-testid="recovery-code" />
      </div>
      <RecoveryCodeActions recoveryCode={recoveryCode} />
      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          data-testid="recovery-saved-checkbox"
          checked={saved}
          onChange={(event) => setSaved(event.target.checked)}
        />
        <Text variant="label" textId="createAccount.recovery.savedCheckbox" />
      </label>
      <Button
        data-testid="recovery-continue"
        disabled={!saved || continueStatus === "submitting"}
        onClick={handleContinue}
      >
        <Text variant="action" textId="createAccount.recovery.continue" />
      </Button>
      {continueStatus === "failed" && (
        <div role="alert">
          <Text variant="error" textId="createAccount.recovery.continueFailed" />
        </div>
      )}
    </div>
  );
};
