// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useState } from "react";
import type { FileEntry, FileListItem } from "../../../../files/types.js";
import { FileGrid } from "../../lists/file-grid/file-grid.js";
import { FileList } from "../../lists/file-list/file-list.js";
import { FolderLoadFailed } from "../../../../errors/folder-load-failed/folder-load-failed.js";
import { TrashConfirmation } from "../file-actions-menu/trash-confirmation.js";
import { RenameEntryDialog } from "../rename-entry-dialog/rename-entry-dialog.js";
import { FolderEmpty } from "../folder-empty/folder-empty.js";
import { FolderList } from "../folder-list/folder-list.js";
import { FolderLoading } from "../folder-loading/folder-loading.js";
import { TrashNotice } from "../trash-notice/trash-notice.js";
import { toFolderLoadingLayout } from "../../to-folder-loading-layout.js";
import { folderContentsListStyle, folderContentsStyle } from "./styles.js";
import type { FolderContentsProps, PendingRename, PendingTrash } from "./types.js";

export const FolderContents = ({
  driveId,
  contents,
  phone,
  view,
  selectedId,
  onSelect,
  onEntryTrashed,
  onEntryRenamed,
}: FolderContentsProps) => {
  const [trashedName, setTrashedName] = useState<string | null>(null);
  const [pendingTrash, setPendingTrash] = useState<PendingTrash | null>(null);
  const [pendingRename, setPendingRename] = useState<PendingRename | null>(null);
  if (contents.status === "loading") {
    return <FolderLoading layout={toFolderLoadingLayout(phone, view)} />;
  }
  const cancelTrash = () => {
    const returnFocusTo = pendingTrash?.returnFocusTo ?? null;
    setPendingTrash(null);
    returnFocusTo?.focus();
  };
  const closeRename = () => {
    const returnFocusTo = pendingRename?.returnFocusTo ?? null;
    setPendingRename(null);
    returnFocusTo?.focus();
  };
  const renamed = (entry: FileEntry) => {
    contents.replaceItem(entry);
    onEntryRenamed(entry);
  };
  const trashed = (entry: FileListItem) => {
    setPendingTrash(null);
    contents.removeItem(entry.id);
    setTrashedName(entry.name);
    onEntryTrashed(entry.id);
  };
  const listProps = {
    driveId,
    items: contents.items,
    hasMore: contents.hasMore,
    isLoadingMore: contents.isLoadingMore,
    onLoadMore: contents.loadMore,
    selectedId,
    onSelect,
    onRename: (entry: FileListItem, returnFocusTo: HTMLElement | null) =>
      setPendingRename({ entry, returnFocusTo }),
    onDelete: (entry: FileListItem, returnFocusTo: HTMLElement | null) =>
      setPendingTrash({ entry, returnFocusTo }),
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
      {pendingRename === null ? null : (
        <RenameEntryDialog
          key={pendingRename.entry.id}
          entry={pendingRename.entry}
          onRenamed={renamed}
          onClose={closeRename}
        />
      )}
      {pendingTrash === null ? null : (
        <TrashConfirmation entry={pendingTrash.entry} onCancel={cancelTrash} onTrashed={trashed} />
      )}
      {contents.items.length === 0 && contents.status === "ready" ? <FolderEmpty /> : null}
      {contents.status === "failed" ? (
        <FolderLoadFailed
          errorTextId={contents.errorTextId ?? "files.errors.failed"}
          onRetry={() => void contents.refresh()}
        />
      ) : null}
    </div>
  );
};
