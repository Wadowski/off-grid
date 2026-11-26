// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { uploadQueueRowActionsStyle } from "./styles.js";
import type { UploadQueueRowActionsProps } from "./types.js";

export const UploadQueueRowActions = ({
  name,
  testIdPrefix,
  canRetry,
  onRetry,
  onDismiss,
}: UploadQueueRowActionsProps) => {
  const { t } = useTranslation();
  return (
    <span style={uploadQueueRowActionsStyle}>
      {canRetry ? (
        <Button
          variant="ghost"
          size="small"
          onClick={onRetry}
          aria-label={t("files.upload.retryNamed", { name })}
          data-testid={`${testIdPrefix}-retry`}
        >
          <Text variant="action" textId="files.upload.retry" element="span" />
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="small"
        onClick={onDismiss}
        aria-label={t("files.upload.dismissNamed", { name })}
        data-testid={`${testIdPrefix}-dismiss`}
      >
        <Text variant="action" textId="files.upload.dismiss" element="span" />
      </Button>
    </span>
  );
};
