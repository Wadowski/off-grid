// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { listFileVersions } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { FileEntry, FilesErrorTextId, FileVersion, FileVersionsState } from "./types.js";

export const useFileVersions = (
  fileId: FileEntry["id"] | null,
  enabled: boolean,
): FileVersionsState => {
  const [versions, setVersions] = useState<readonly FileVersion[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    if (fileId === null) {
      return;
    }
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setStatus("loading");
    setErrorTextId(null);
    try {
      const list = await listFileVersions(fileId);
      if (isLatest()) {
        setVersions(list);
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

  return { versions, status, errorTextId, refresh };
};
