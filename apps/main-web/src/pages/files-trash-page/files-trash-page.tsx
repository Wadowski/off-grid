// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema } from "@offgrid/contracts";
import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { ItemNotFound } from "../../errors/item-not-found/item-not-found.js";
import { useDriveTrash } from "../../files/use-drive-trash.js";
import { toRestoredPath } from "../../files/to-restored-path.js";
import type { FileListItem } from "../../files/types.js";
import { useRestoreEntry } from "../../files/use-restore-entry.js";
import type { FilesOutletContext } from "../../layouts/files-layout/types.js";
import { useMediaQuery } from "../../media/use-media-query.js";
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
  const switcher = useOutletContext<FilesOutletContext>();
  const trash = useDriveTrash(driveId, driveId !== null);
  const restore = useRestoreEntry();
  const [notice, setNotice] = useState<RestoreNotice | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusId === null) {
      return;
    }
    if (focusId === EMPTY_FOCUS_ID) {
      contentRef.current?.querySelector<HTMLElement>("[data-testid='trash-empty']")?.focus();
    } else {
      findElementByRestoreId(contentRef.current, focusId)?.focus();
    }
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

  const restoring = restore.status === "pending";

  return (
    <div style={trashPageStyle} data-testid="trash-page" ref={contentRef}>
      <TrashHeader driveId={driveId} driveName={drive?.name ?? null} />
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
            restoring={restoring}
            onRestore={(item) => void restoreItem(item)}
          />
        ) : (
          <TrashTable
            items={trash.items}
            restoring={restoring}
            onRestore={(item) => void restoreItem(item)}
          />
        )
      ) : null}
    </div>
  );
};
