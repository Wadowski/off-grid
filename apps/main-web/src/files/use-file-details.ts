// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { getFile } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { Breadcrumb, FileDetailsState, FileEntry, FilesErrorTextId } from "./types.js";

export const useFileDetails = (
  fileId: FileEntry["id"] | null,
  enabled: boolean,
): FileDetailsState => {
  const [file, setFile] = useState<FileEntry | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<readonly Breadcrumb[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const [loadedFor, setLoadedFor] = useState<FileEntry["id"] | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    if (fileId === null) {
      return;
    }
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setLoadedFor(fileId);
    setFile(null);
    setBreadcrumbs([]);
    setStatus("loading");
    setErrorTextId(null);
    try {
      const details = await getFile(fileId);
      if (isLatest()) {
        setFile(details.file);
        setBreadcrumbs(details.breadcrumbs);
        setStatus("ready");
      }
    } catch (error) {
      if (isLatest()) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
      }
    }
  }, [fileId]);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  if (loadedFor !== fileId) {
    // The state still belongs to the previous folder until refresh() runs for this one.
    return { file: null, breadcrumbs: [], status: "loading", errorTextId: null, refresh };
  }
  return { file, breadcrumbs, status, errorTextId, refresh };
};
