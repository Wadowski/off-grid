// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { folderPickerFooterStyle } from "./styles.js";
import type { FolderPickerFooterProps } from "./types.js";

export const FolderPickerFooter = ({
  nodeId,
  state,
  onRetry,
  onLoadMore,
}: FolderPickerFooterProps) => {
  if (state === undefined || (state.status === "loading" && !state.isLoadingMore)) {
    return (
      <div style={folderPickerFooterStyle}>
        <Text variant="caption" textId="files.move.loading" />
      </div>
    );
  }
  if (state.status === "failed") {
    return (
      <div style={folderPickerFooterStyle}>
        <Text variant="error" textId="files.move.loadFailed" />
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={onRetry}
          data-testid={`move-dialog-retry-${nodeId}`}
        >
          <Text variant="action" textId="files.move.retry" />
        </Button>
      </div>
    );
  }
  if (state.nextCursor !== null) {
    return (
      <div style={folderPickerFooterStyle}>
        <Button
          type="button"
          variant="ghost"
          size="small"
          disabled={state.isLoadingMore}
          onClick={onLoadMore}
          data-testid={`move-dialog-load-more-${nodeId}`}
        >
          <Text variant="action" textId="files.move.loadMore" />
        </Button>
      </div>
    );
  }
  if (state.folders.length === 0) {
    return (
      <div style={folderPickerFooterStyle}>
        <Text variant="caption" textId="files.move.emptyFolder" />
      </div>
    );
  }
  return null;
};
