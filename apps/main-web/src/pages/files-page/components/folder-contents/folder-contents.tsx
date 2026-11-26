// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { MoveDialog } from "../../../../files/components/move-dialog/move-dialog.js";
import type { FileListItem, MoveNotice } from "../../../../files/types.js";
import { FileGrid } from "../../lists/file-grid/file-grid.js";
import { FileList } from "../../lists/file-list/file-list.js";
import { TrashConfirmation } from "../file-actions-menu/trash-confirmation.js";
import { FolderList } from "../folder-list/folder-list.js";
import { MoveResultNotice } from "../move-result-notice/move-result-notice.js";
import { TrashNotice } from "../trash-notice/trash-notice.js";
import {
  folderContentsErrorStyle,
  folderContentsListStyle,
  folderContentsStyle,
} from "./styles.js";
import type { FolderContentsProps, PendingEntryAction } from "./types.js";

export const FolderContents = ({
  drives,
  driveId,
  folderId,
  contents,
  phone,
  view,
  selectedId,
  onSelect,
  onEntryLeft,
}: FolderContentsProps) => {
  const [trashedName, setTrashedName] = useState<string | null>(null);
  const [pendingTrash, setPendingTrash] = useState<PendingEntryAction | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingEntryAction | null>(null);
  const [moveNotice, setMoveNotice] = useState<MoveNotice | null>(null);
  if (contents.status === "loading") {
    return <Text variant="body" textId="files.folder.loading" data-testid="files-folder-loading" />;
  }
  const cancelTrash = () => {
    const returnFocusTo = pendingTrash?.returnFocusTo ?? null;
    setPendingTrash(null);
    returnFocusTo?.focus();
  };
  const trashed = (entry: FileListItem) => {
    setPendingTrash(null);
    contents.removeItem(entry.id);
    setTrashedName(entry.name);
    onEntryLeft(entry.id);
  };
  const closeMove = () => setPendingMove(null);
  const moved = (notice: MoveNotice) => {
    if (pendingMove === null) {
      return;
    }
    const movedId = pendingMove.entry.id;
    setPendingMove(null);
    contents.removeItem(movedId);
    setMoveNotice(notice);
    onEntryLeft(movedId);
    void contents.refreshQuietly();
  };
  const listProps = {
    driveId,
    items: contents.items,
    hasMore: contents.hasMore,
    isLoadingMore: contents.isLoadingMore,
    onLoadMore: contents.loadMore,
    selectedId,
    onSelect,
    onDelete: (entry: FileListItem, returnFocusTo: HTMLElement | null) =>
      setPendingTrash({ entry, returnFocusTo }),
    onMove: (entry: FileListItem, returnFocusTo: HTMLElement | null) =>
      setPendingMove({ entry, returnFocusTo }),
  };
  return (
    <div style={folderContentsStyle} data-testid="files-folder-contents">
      <TrashNotice name={trashedName} onDismiss={() => setTrashedName(null)} />
      <MoveResultNotice notice={moveNotice} onDismiss={() => setMoveNotice(null)} />
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
      {pendingTrash === null ? null : (
        <TrashConfirmation entry={pendingTrash.entry} onCancel={cancelTrash} onTrashed={trashed} />
      )}
      {pendingMove === null ? null : (
        <MoveDialog
          drives={drives}
          source={{
            entryId: pendingMove.entry.id,
            entryName: pendingMove.entry.name,
            driveId,
            parentId: folderId,
          }}
          narrow={phone}
          onClose={closeMove}
          onMoved={moved}
        />
      )}
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
