// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { listFolderPage } from "./list-folder-page.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import { toFolderTargetKey } from "./to-folder-target-key.js";
import type {
  Breadcrumb,
  FileEntry,
  FilesErrorTextId,
  FolderContentsState,
  FolderTarget,
} from "./types.js";

export const useFolderContents = (target: FolderTarget, enabled: boolean): FolderContentsState => {
  const targetKey = toFolderTargetKey(target);
  const stableTarget = useMemo(() => target, [targetKey]);
  const [items, setItems] = useState<readonly FileEntry[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<readonly Breadcrumb[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setItems([]);
    setBreadcrumbs([]);
    setNextCursor(null);
    setStatus("loading");
    setErrorTextId(null);
    try {
      const page = await listFolderPage(stableTarget);
      if (isLatest()) {
        setItems(page.items);
        setBreadcrumbs(page.breadcrumbs);
        setNextCursor(page.nextCursor);
        setStatus("ready");
      }
    } catch (error) {
      if (isLatest()) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
      }
    }
  }, [stableTarget]);

  const loadMore = useCallback(async () => {
    if (nextCursor === null) {
      return;
    }
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    try {
      const page = await listFolderPage(stableTarget, nextCursor);
      if (isLatest()) {
        setItems((current) => [...current, ...page.items]);
        setNextCursor(page.nextCursor);
      }
    } catch (error) {
      if (isLatest()) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
      }
    }
  }, [stableTarget, nextCursor]);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  return {
    items,
    breadcrumbs,
    status,
    errorTextId,
    hasMore: nextCursor !== null,
    loadMore,
    refresh,
  };
};
