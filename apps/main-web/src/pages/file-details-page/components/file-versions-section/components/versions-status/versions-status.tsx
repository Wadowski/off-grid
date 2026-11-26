// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { versionsStatusStyle } from "./styles.js";
import type { VersionsStatusProps } from "./types.js";

export const VersionsStatus = ({ status, errorTextId, onRetry }: VersionsStatusProps) => {
  if (status === "loading") {
    return <Text variant="body" textId="files.folder.loading" />;
  }
  return (
    <div style={versionsStatusStyle}>
      {status === "failed" ? (
        <div role="alert" style={versionsStatusStyle}>
          <Text variant="error" textId="files.versions.failed" />
          <Button type="button" variant="secondary" onClick={() => void onRetry()}>
            <Text variant="action" textId="files.folder.retry" />
          </Button>
        </div>
      ) : null}
      {status !== "failed" && errorTextId !== null ? (
        <div role="alert" style={versionsStatusStyle}>
          <Text variant="error" textId={errorTextId} />
        </div>
      ) : null}
    </div>
  );
};
