// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_DRIVE_TRASH } from "./constants.js";
import { readAllTrashPages } from "./read-all-trash-pages.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import { toTrashRoots } from "./to-trash-roots.js";
import type { Drive, DriveTrashSnapshot, DriveTrashState, FileListItem } from "./types.js";

export const useDriveTrash = (driveId: Drive["id"] | null, enabled: boolean): DriveTrashState => {
  const targetKey = driveId ?? "";
  const [snapshot, setSnapshot] = useState<DriveTrashSnapshot>(EMPTY_DRIVE_TRASH);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    if (driveId === null) {
      return;
    }
    const request = ++latestRequest.current;
    setLoadedFor(targetKey);
    setSnapshot(EMPTY_DRIVE_TRASH);
    try {
      const items = await readAllTrashPages(driveId);
      if (request === latestRequest.current) {
        setSnapshot({ items, status: "ready", errorTextId: null });
      }
    } catch (error) {
      if (request === latestRequest.current) {
        setSnapshot({ items: [], status: "failed", errorTextId: toFilesErrorTextId(error) });
      }
    }
  }, [driveId, targetKey]);

  const refreshQuietly = useCallback(async () => {
    if (driveId === null) {
      return;
    }
    const request = ++latestRequest.current;
    const items = await readAllTrashPages(driveId).catch(() => null);
    if (items !== null && request === latestRequest.current) {
      setSnapshot({ items, status: "ready", errorTextId: null });
    }
  }, [driveId]);

  const removeItem = useCallback((fileId: FileListItem["id"]) => {
    setSnapshot((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== fileId),
    }));
  }, []);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  const roots = useMemo(() => toTrashRoots(snapshot.items), [snapshot.items]);

  if (loadedFor !== targetKey) {
    return {
      items: [],
      status: "loading",
      errorTextId: null,
      refresh,
      refreshQuietly,
      removeItem,
    };
  }
  return {
    items: roots,
    status: snapshot.status,
    errorTextId: snapshot.errorTextId,
    refresh,
    refreshQuietly,
    removeItem,
  };
};
