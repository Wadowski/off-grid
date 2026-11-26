// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef, useState } from "react";
import { purgeFile } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { FileEntry, FilesErrorTextId, PurgeEntryState, TrashEntryStatus } from "./types.js";

export const usePurgeEntry = (): PurgeEntryState => {
  const [status, setStatus] = useState<TrashEntryStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const inFlight = useRef(false);

  const purge = async (fileId: FileEntry["id"]): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setStatus("pending");
    setErrorTextId(null);
    try {
      await purgeFile(fileId);
      setStatus("idle");
      return true;
    } catch (error) {
      setStatus("failed");
      setErrorTextId(toFilesErrorTextId(error));
      return false;
    } finally {
      inFlight.current = false;
    }
  };

  return { status, errorTextId, purge };
};
