// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useRef } from "react";
import { useUploadQueueContext } from "../uploads/index.js";
import type { Drive, FileEntry } from "./types.js";

export const useRefreshOnUploadDone = (
  driveId: Drive["id"] | null,
  folderId: FileEntry["id"] | null,
  refreshQuietly: () => Promise<void>,
): void => {
  const { lastDone } = useUploadQueueContext();
  const seenDone = useRef(lastDone);

  useEffect(() => {
    if (lastDone === seenDone.current) {
      return;
    }
    seenDone.current = lastDone;
    if (lastDone !== null && lastDone.driveId === driveId && lastDone.folderId === folderId) {
      void refreshQuietly();
    }
  }, [lastDone, driveId, folderId, refreshQuietly]);
};
