// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useRef, useState } from "react";
import { emptyDriveTrash } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type { Drive, FilesErrorTextId, EmptyTrashState, TrashEntryStatus } from "./types.js";

export const useEmptyTrash = (): EmptyTrashState => {
  const [status, setStatus] = useState<TrashEntryStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const inFlight = useRef(false);

  const empty = async (driveId: Drive["id"]): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    setStatus("pending");
    setErrorTextId(null);
    try {
      await emptyDriveTrash(driveId);
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

  return { status, errorTextId, empty };
};
