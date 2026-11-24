// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { fileDetailsPanelStatusStyle } from "./styles.js";
import type { FileDetailsPanelStatusProps } from "./types.js";

export const FileDetailsPanelStatus = (props: FileDetailsPanelStatusProps) => {
  if (props.kind === "loading") {
    return (
      <div style={fileDetailsPanelStatusStyle} data-testid="file-details-panel-loading">
        <Text variant="body" textId="files.details.loading" />
      </div>
    );
  }
  return (
    <div style={fileDetailsPanelStatusStyle}>
      <Text
        variant="error"
        role="alert"
        textId={props.errorTextId}
        data-testid="file-details-panel-error"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => void props.onRetry()}
        data-testid="file-details-panel-retry"
      >
        <Text variant="action" textId="files.details.retry" />
      </Button>
    </div>
  );
};
