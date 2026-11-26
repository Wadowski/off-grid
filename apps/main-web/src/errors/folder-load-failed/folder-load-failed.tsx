// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { folderLoadFailedStyle } from "./styles.js";
import type { FolderLoadFailedProps } from "./types.js";

export const FolderLoadFailed = ({ errorTextId, onRetry }: FolderLoadFailedProps) => (
  <div style={folderLoadFailedStyle} data-testid="files-load-failed">
    <Text variant="error" role="alert" textId={errorTextId} />
    <Button type="button" variant="secondary" onClick={onRetry} data-testid="files-retry">
      <Text variant="action" textId="files.folder.retry" />
    </Button>
  </div>
);
