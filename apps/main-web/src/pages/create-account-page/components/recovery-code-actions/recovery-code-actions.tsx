// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { copyRecoveryCode } from "./copy-recovery-code.js";
import { downloadRecoveryCodeFile } from "./download-recovery-code-file.js";
import { recoveryCodeActionsStyle } from "./styles.js";
import type { RecoveryCodeActionsProps, RecoveryCopyStatus } from "./types.js";

export const RecoveryCodeActions = ({ recoveryCode }: RecoveryCodeActionsProps) => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<RecoveryCopyStatus>("idle");

  const handleCopy = async () => {
    try {
      await copyRecoveryCode(recoveryCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  const handleDownload = () => {
    downloadRecoveryCodeFile(
      recoveryCode,
      t("createAccount.recovery.fileHeading"),
      t("createAccount.recovery.explanation"),
    );
  };

  return (
    <>
      <div style={recoveryCodeActionsStyle}>
        <Button variant="secondary" data-testid="recovery-copy" onClick={handleCopy}>
          <Text variant="action" textId="createAccount.recovery.copy" />
        </Button>
        <Button variant="secondary" data-testid="recovery-download" onClick={handleDownload}>
          <Text variant="action" textId="createAccount.recovery.download" />
        </Button>
      </div>
      <div role="status" data-testid="recovery-copy-status">
        {copyStatus === "copied" && (
          <Text variant="status" textId="createAccount.recovery.copied" />
        )}
        {copyStatus === "failed" && (
          <Text variant="error" textId="createAccount.recovery.copyFailed" />
        )}
      </div>
    </>
  );
};
