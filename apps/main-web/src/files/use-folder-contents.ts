// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_FOLDER_CONTENTS } from "./constants.js";
import { fetchFolderPage } from "./fetch-folder-page.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import { toReadySnapshot } from "./to-ready-snapshot.js";
import type {
  Drive,
  FileEntry,
  FileListItem,
  FilesSortOrder,
  FolderContentsSnapshot,
  FolderContentsState,
} from "./types.js";

export const useFolderContents = (
  driveId: Drive["id"] | null,
  folderId: FileEntry["id"] | null,
  enabled: boolean,
  order: FilesSortOrder,
): FolderContentsState => {
  const { sort, direction } = order;
  const sortOrder = useMemo(() => ({ sort, direction }), [sort, direction]);
  const targetKey = `${driveId ?? ""}:${folderId ?? ""}:${sort}:${direction}`;
  const [snapshot, setSnapshot] = useState<FolderContentsSnapshot>(EMPTY_FOLDER_CONTENTS);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const latestRequest = useRef(0);
  const nextCursor = snapshot.nextCursor;

  const refresh = useCallback(async () => {
    if (driveId === null) {
      return;
    }
    const request = ++latestRequest.current;
    setLoadedFor(targetKey);
    setSnapshot(EMPTY_FOLDER_CONTENTS);
    try {
      const page = await fetchFolderPage(driveId, folderId, null, sortOrder);
      if (request === latestRequest.current) {
        setSnapshot(toReadySnapshot(page));
      }
    } catch (error) {
      if (request === latestRequest.current) {
        setSnapshot({
          ...EMPTY_FOLDER_CONTENTS,
          status: "failed",
          errorTextId: toFilesErrorTextId(error),
        });
      }
    }
  }, [driveId, folderId, sortOrder, targetKey]);

  const refreshQuietly = useCallback(async () => {
    if (driveId === null) {
      return;
    }
    const request = ++latestRequest.current;
    const page = await fetchFolderPage(driveId, folderId, null, sortOrder).catch(() => null);
    if (page !== null && request === latestRequest.current) {
      setSnapshot(toReadySnapshot(page));
    }
  }, [driveId, folderId, sortOrder]);

  const loadMore = useCallback(async () => {
    if (driveId === null || nextCursor === null) {
      return;
    }
    const request = ++latestRequest.current;
    setSnapshot((current) => ({ ...current, isLoadingMore: true }));
    try {
      const page = await fetchFolderPage(driveId, folderId, nextCursor, sortOrder);
      if (request === latestRequest.current) {
        setSnapshot((current) => ({
          ...current,
          items: [...current.items, ...page.items],
          nextCursor: page.nextCursor,
          isLoadingMore: false,
        }));
      }
    } catch (error) {
      if (request === latestRequest.current) {
        setSnapshot((current) => ({
          ...current,
          status: "failed",
          errorTextId: toFilesErrorTextId(error),
          isLoadingMore: false,
        }));
      }
    }
  }, [driveId, folderId, nextCursor, sortOrder]);

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

  if (loadedFor !== targetKey) {
    return {
      items: [],
      status: "loading",
      errorTextId: null,
      hasMore: false,
      isLoadingMore: false,
      loadMore,
      refresh,
      refreshQuietly,
      removeItem,
    };
  }
  return {
    items: snapshot.items,
    status: snapshot.status,
    errorTextId: snapshot.errorTextId,
    hasMore: snapshot.nextCursor !== null,
    isLoadingMore: snapshot.isLoadingMore,
    loadMore,
    refresh,
    refreshQuietly,
    removeItem,
  };
};
