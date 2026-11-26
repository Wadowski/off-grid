// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef, useState } from "react";
import { renameEntry } from "./rename-entry.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { FileEntry, FilesErrorTextId, RenameEntryState, RenameEntryStatus } from "./types.js";

export const useRenameEntry = (): RenameEntryState => {
  const [status, setStatus] = useState<RenameEntryStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const inFlight = useRef(false);

  const rename = async (fileId: FileEntry["id"], name: string): Promise<FileEntry | null> => {
    if (inFlight.current) {
      return null;
    }
    inFlight.current = true;
    setStatus("submitting");
    setErrorTextId(null);
    try {
      const entry = await renameEntry(fileId, name);
      setStatus("idle");
      return entry;
    } catch (error) {
      setErrorTextId(toFilesErrorTextId(error));
      setStatus("failed");
      return null;
    } finally {
      inFlight.current = false;
    }
  };

  return { status, errorTextId, rename };
};
