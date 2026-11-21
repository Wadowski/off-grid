// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { ListStatus } from "../types.js";
import { listDrives } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { Drive, DrivesState, FilesErrorTextId } from "./types.js";

export const useDrives = (enabled: boolean): DrivesState => {
  const [drives, setDrives] = useState<readonly Drive[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setStatus("loading");
    setErrorTextId(null);
    try {
      const list = await listDrives();
      if (isLatest()) {
        setDrives(list);
        setStatus("ready");
      }
    } catch (error) {
      if (isLatest()) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  return { drives, status, errorTextId, refresh };
};
