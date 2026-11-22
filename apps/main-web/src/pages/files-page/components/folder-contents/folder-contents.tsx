// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { FolderList } from "../folder-list/folder-list.js";
import { folderContentsErrorStyle, folderContentsStyle } from "./styles.js";
import type { FolderContentsProps } from "./types.js";

export const FolderContents = ({ driveId, contents }: FolderContentsProps) => {
  if (contents.status === "loading") {
    return <Text variant="body" textId="files.folder.loading" />;
  }
  return (
    <div style={folderContentsStyle} data-testid="files-folder-contents">
      {contents.items.length > 0 ? (
        <FolderList
          driveId={driveId}
          items={contents.items}
          hasMore={contents.hasMore}
          isLoadingMore={contents.isLoadingMore}
          onLoadMore={contents.loadMore}
        />
      ) : null}
      {contents.items.length === 0 && contents.status === "ready" ? (
        <Text variant="body" textId="files.folder.empty" data-testid="files-empty" />
      ) : null}
      {contents.status === "failed" ? (
        <div style={folderContentsErrorStyle}>
          <Text
            variant="error"
            role="alert"
            textId={contents.errorTextId ?? "files.errors.failed"}
            data-testid="files-contents-error"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void contents.refresh()}
            data-testid="files-retry"
          >
            <Text variant="action" textId="files.folder.retry" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};
