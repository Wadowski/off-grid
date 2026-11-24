// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import type { FileListItem } from "../../../../files/types.js";
import { FileGrid } from "../../lists/file-grid/file-grid.js";
import { FileList } from "../../lists/file-list/file-list.js";
import { FolderList } from "../folder-list/folder-list.js";
import { TrashNotice } from "../trash-notice/trash-notice.js";
import {
  folderContentsErrorStyle,
  folderContentsListStyle,
  folderContentsStyle,
} from "./styles.js";
import type { FolderContentsProps } from "./types.js";

export const FolderContents = ({
  driveId,
  contents,
  phone,
  view,
  selectedId,
  onSelect,
  onEntryTrashed,
}: FolderContentsProps) => {
  const [trashedName, setTrashedName] = useState<string | null>(null);
  if (contents.status === "loading") {
    return <Text variant="body" textId="files.folder.loading" data-testid="files-folder-loading" />;
  }
  const listProps = {
    driveId,
    items: contents.items,
    hasMore: contents.hasMore,
    isLoadingMore: contents.isLoadingMore,
    onLoadMore: contents.loadMore,
    selectedId,
    onSelect,
    onTrashed: (entry: FileListItem) => {
      contents.removeItem(entry.id);
      setTrashedName(entry.name);
      onEntryTrashed(entry.id);
    },
  };
  return (
    <div style={folderContentsStyle} data-testid="files-folder-contents">
      <TrashNotice name={trashedName} onDismiss={() => setTrashedName(null)} />
      {contents.items.length > 0 ? (
        <div style={folderContentsListStyle}>
          {phone ? (
            <FolderList {...listProps} />
          ) : view === "grid" ? (
            <FileGrid {...listProps} />
          ) : (
            <FileList {...listProps} />
          )}
        </div>
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
