// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useRef, useState } from "react";
import { FileList } from "../../lists/file-list/file-list.js";
import { FolderList } from "../folder-list/folder-list.js";
import { FileDetailsPanel } from "../file-details-panel/file-details-panel.js";
import type { FileListItem } from "../../../../files/types.js";
import { focusSelectedRow } from "./focus-selected-row.js";
import {
  folderContentsBodyStyle,
  folderContentsErrorStyle,
  folderContentsListStyle,
  folderContentsStyle,
} from "./styles.js";
import type { FolderContentsProps } from "./types.js";

export const FolderContents = ({ driveId, contents, phone }: FolderContentsProps) => {
  const [selectedId, setSelectedId] = useState<FileListItem["id"] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  if (contents.status === "loading") {
    return <Text variant="body" textId="files.folder.loading" />;
  }
  const detailsFileId = phone ? null : selectedId;
  const closeDetails = () => {
    focusSelectedRow(listRef.current);
    setSelectedId(null);
  };
  const listProps = {
    driveId,
    items: contents.items,
    hasMore: contents.hasMore,
    isLoadingMore: contents.isLoadingMore,
    selectedId,
    onSelect: setSelectedId,
    onLoadMore: contents.loadMore,
  };
  return (
    <div style={folderContentsStyle} data-testid="files-folder-contents">
      {contents.items.length > 0 ? (
        <div style={folderContentsBodyStyle(detailsFileId !== null)}>
          <div ref={listRef} style={folderContentsListStyle}>
            {phone ? <FolderList {...listProps} /> : <FileList {...listProps} />}
          </div>
          {detailsFileId === null ? null : (
            <FileDetailsPanel fileId={detailsFileId} onClose={closeDetails} />
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
