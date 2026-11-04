// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { completeRegistration } from "../../../../session/complete-registration.js";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { AccountIntro } from "../account-intro/account-intro.js";
import { RecoveryCodeActions } from "../recovery-code-actions/recovery-code-actions.js";
import {
  checkboxLabelStyle,
  recoveryCodeBoxStyle,
  recoveryCodeStepStyle,
  saveBlockStyle,
} from "./styles.js";
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
      <AccountIntro
        icon="key"
        pillTextId="createAccount.pill.recovery"
        headingTextId="createAccount.recovery.heading"
        bodyTextId="createAccount.recovery.explanation"
      />
      <div style={recoveryCodeBoxStyle}>
        <Text variant="subheading" value={recoveryCode} data-testid="recovery-code" />
      </div>
      <RecoveryCodeActions recoveryCode={recoveryCode} />
      <div style={saveBlockStyle}>
        <label style={checkboxLabelStyle}>
          <input
            type="checkbox"
            data-testid="recovery-saved-checkbox"
            checked={saved}
            onChange={(event) => setSaved(event.target.checked)}
          />
          <Text variant="body" textId="createAccount.recovery.savedCheckbox" />
        </label>
        <Button
          data-testid="recovery-continue"
          disabled={!saved || continueStatus === "submitting"}
          onClick={handleContinue}
        >
          <Text variant="action" textId="createAccount.recovery.continue" />
          <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
        </Button>
      </div>
      {continueStatus === "failed" && (
        <div role="alert">
          <Text variant="error" textId="createAccount.recovery.continueFailed" />
        </div>
      )}
    </div>
  );
};
