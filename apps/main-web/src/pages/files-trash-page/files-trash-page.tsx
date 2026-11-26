// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema } from "@offgrid/contracts";
import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { ItemNotFound } from "../../errors/item-not-found/item-not-found.js";
import { useDriveTrash } from "../../files/use-drive-trash.js";
import { useEmptyTrash } from "../../files/use-empty-trash.js";
import { usePurgeEntry } from "../../files/use-purge-entry.js";
import { toRestoredPath } from "../../files/to-restored-path.js";
import type { FileListItem } from "../../files/types.js";
import { useRestoreEntry } from "../../files/use-restore-entry.js";
import type { FilesOutletContext } from "../../layouts/files-layout/types.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import { EmptyTrashDialog } from "./components/empty-trash-dialog/empty-trash-dialog.js";
import { PurgeEntryDialog } from "./components/purge-entry-dialog/purge-entry-dialog.js";
import { RestoredNotice } from "./components/restored-notice/restored-notice.js";
import { TrashHeader } from "./components/trash-header/trash-header.js";
import { TrashPhoneList } from "./components/trash-phone-list/trash-phone-list.js";
import { TrashTable } from "./components/trash-table/trash-table.js";
import { findElementByRestoreId } from "./find-element-by-restore-id.js";
import { toNextFocusId } from "./to-next-focus-id.js";
import { trashEmptyStyle, trashErrorActionStyle, trashPageStyle } from "./styles.js";
import type { RestoreNotice } from "./types.js";

const EMPTY_FOCUS_ID = "";

export const FilesTrashPage = () => {
  const { driveId: routeDriveId } = useParams();
  const parsedDriveId = driveIdSchema.safeParse(routeDriveId);
  const driveId = parsedDriveId.success ? parsedDriveId.data : null;
  const phone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const narrow = useIsNarrow();
  const switcher = useOutletContext<FilesOutletContext>();
  const trash = useDriveTrash(driveId, driveId !== null);
  const restore = useRestoreEntry();
  const purge = usePurgeEntry();
  const emptyTrash = useEmptyTrash();
  const [notice, setNotice] = useState<RestoreNotice | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<FileListItem | null>(null);
  const [isEmptyTrashOpen, setIsEmptyTrashOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusId === null) {
      return;
    }
    const target =
      focusId === EMPTY_FOCUS_ID
        ? contentRef.current?.querySelector<HTMLElement>("[data-testid='trash-empty']")
        : findElementByRestoreId(contentRef.current, focusId);
    if (target === undefined || target === null) {
      return;
    }
    target.focus();
    setFocusId(null);
  }, [focusId, trash.items]);

  if (driveId === null) {
    return <ItemNotFound kind="folder" />;
  }

  const drive = switcher.drives.find((listed) => listed.id === driveId) ?? null;

  const restoreItem = async (item: FileListItem) => {
    const nextFocusId = toNextFocusId(trash.items, item.id);
    const restored = await restore.restore(item.id);
    if (restored === null) {
      void trash.refreshQuietly();
      return;
    }
    setNotice({ name: restored.name, path: toRestoredPath(driveId, restored) });
    setFocusId(nextFocusId);
    trash.removeItem(item.id);
    void trash.refreshQuietly();
  };

  const purgeItem = async (item: FileListItem) => {
    const nextFocusId = toNextFocusId(trash.items, item.id);
    const purged = await purge.purge(item.id);
    if (!purged) {
      void trash.refreshQuietly();
      return;
    }
    setPurgeTarget(null);
    setFocusId(nextFocusId);
    trash.removeItem(item.id);
    void trash.refreshQuietly();
  };

  const emptyEverything = async () => {
    const emptied = await emptyTrash.empty(driveId);
    if (!emptied) {
      void trash.refreshQuietly();
      return;
    }
    setIsEmptyTrashOpen(false);
    setNotice(null);
    setFocusId(EMPTY_FOCUS_ID);
    await trash.refresh();
  };

  const restoring = restore.status === "pending";
  const purging = purge.status === "pending";
  const emptying = emptyTrash.status === "pending";
  const busy = restoring || purging || emptying;

  const closePurgeUnlessPending = () => {
    if (!purging) {
      setPurgeTarget(null);
    }
  };

  const closeEmptyTrashUnlessPending = () => {
    if (!emptying) {
      setIsEmptyTrashOpen(false);
    }
  };

  return (
    <div style={trashPageStyle} data-testid="trash-page" ref={contentRef}>
      <TrashHeader
        driveId={driveId}
        driveName={drive?.name ?? null}
        showEmptyTrash={trash.status === "ready" && trash.items.length > 0}
        emptying={emptying}
        onEmptyTrash={() => setIsEmptyTrashOpen(true)}
      />
      {notice === null ? null : (
        <RestoredNotice name={notice.name} path={notice.path} onDismiss={() => setNotice(null)} />
      )}
      {trash.status === "loading" ? <Text variant="body" textId="files.trash.loading" /> : null}
      {trash.status === "failed" ? (
        <div style={trashErrorActionStyle}>
          <Text
            variant="error"
            role="alert"
            textId={trash.errorTextId ?? "files.errors.failed"}
            data-testid="trash-error"
          />
          <Button variant="secondary" onClick={() => void trash.refresh()}>
            <MaterialIcon name="refresh" size="1.125rem" color="currentColor" />
            <Text variant="action" element="span" textId="files.folder.retry" />
          </Button>
        </div>
      ) : null}
      {restore.errorTextId === null ? null : (
        <Text
          variant="error"
          role="alert"
          textId={restore.errorTextId}
          data-testid="trash-restore-error"
        />
      )}
      {trash.status === "ready" && trash.items.length === 0 ? (
        <div style={trashEmptyStyle} tabIndex={-1} data-testid="trash-empty">
          <Text variant="subheading" textId="files.trash.empty" />
          <Text variant="caption" textId="files.trash.emptyHint" />
        </div>
      ) : null}
      {trash.status === "ready" && trash.items.length > 0 ? (
        phone ? (
          <TrashPhoneList
            items={trash.items}
            busy={busy}
            onRestore={(item) => void restoreItem(item)}
            onPurge={setPurgeTarget}
          />
        ) : (
          <TrashTable
            items={trash.items}
            busy={busy}
            onRestore={(item) => void restoreItem(item)}
            onPurge={setPurgeTarget}
          />
        )
      ) : null}
      {purgeTarget === null ? null : (
        <PurgeEntryDialog
          name={purgeTarget.name}
          isFolder={purgeTarget.isFolder}
          narrow={narrow}
          pending={purging}
          errorTextId={purge.errorTextId}
          onCancel={closePurgeUnlessPending}
          onConfirm={() => void purgeItem(purgeTarget)}
        />
      )}
      {isEmptyTrashOpen ? (
        <EmptyTrashDialog
          narrow={narrow}
          pending={emptying}
          errorTextId={emptyTrash.errorTextId}
          onCancel={closeEmptyTrashUnlessPending}
          onConfirm={() => void emptyEverything()}
        />
      ) : null}
    </div>
  );
};
