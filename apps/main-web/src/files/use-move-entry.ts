// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useRef, useState } from "react";
import { moveEntry } from "./move-entry.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type {
  FileEntry,
  FilesErrorTextId,
  MoveEntryState,
  MoveEntryStatus,
  MoveFileResult,
  MoveTarget,
} from "./types.js";

export const useMoveEntry = (): MoveEntryState => {
  const [status, setStatus] = useState<MoveEntryStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const inFlight = useRef(false);

  const move = useCallback(
    async (fileId: FileEntry["id"], target: MoveTarget): Promise<MoveFileResult | null> => {
      if (inFlight.current) {
        return null;
      }
      inFlight.current = true;
      setStatus("moving");
      setErrorTextId(null);
      try {
        const result = await moveEntry(fileId, target);
        setStatus("idle");
        return result;
      } catch (error) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
        return null;
      } finally {
        inFlight.current = false;
      }
    },
    [],
  );

  return { status, errorTextId, move };
};
