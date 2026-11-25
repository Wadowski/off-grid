// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef, useState } from "react";
import { restoreFile } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { FileEntry, FilesErrorTextId, RestoreEntryState, TrashEntryStatus } from "./types.js";

export const useRestoreEntry = (): RestoreEntryState => {
  const [status, setStatus] = useState<TrashEntryStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const inFlight = useRef(false);

  const restore = async (fileId: FileEntry["id"]): Promise<FileEntry | null> => {
    if (inFlight.current) {
      return null;
    }
    inFlight.current = true;
    setStatus("pending");
    setErrorTextId(null);
    try {
      const restored = await restoreFile(fileId);
      setStatus("idle");
      return restored;
    } catch (error) {
      setStatus("failed");
      setErrorTextId(toFilesErrorTextId(error));
      return null;
    } finally {
      inFlight.current = false;
    }
  };

  return { status, errorTextId, restore };
};
