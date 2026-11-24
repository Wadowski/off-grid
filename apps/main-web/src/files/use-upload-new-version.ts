// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef } from "react";
import { useUploadQueueContext } from "../uploads/index.js";
import type { VersionUploadTarget } from "../uploads/index.js";
import type { FileEntry } from "./types.js";

export const useUploadNewVersion = (
  target: VersionUploadTarget,
  onUploaded: () => void,
): ((file: File) => void) => {
  const { enqueueVersion, lastDone } = useUploadQueueContext();
  const seenDone = useRef(lastDone);
  const fileId: FileEntry["id"] = target.fileId;

  useEffect(() => {
    if (lastDone === seenDone.current) {
      return;
    }
    seenDone.current = lastDone;
    if (lastDone !== null && lastDone.fileId === fileId) {
      onUploaded();
    }
  }, [lastDone, fileId, onUploaded]);

  return useCallback((file: File) => enqueueVersion(file, target), [enqueueVersion, target]);
};
