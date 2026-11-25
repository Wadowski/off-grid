// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { getFileContent } from "./files-api.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import { toPreviewKind } from "./to-preview-kind.js";
import type { FileContent, FileContentState, RegularFileEntry } from "./types.js";

export const useFileContent = (file: RegularFileEntry): FileContent => {
  const [state, setState] = useState<FileContentState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    let objectUrl: string | null = null;
    if (toPreviewKind(file.mimeType) === null) {
      setState({ status: "unsupported" });
      return undefined;
    }
    setState({ status: "loading" });
    getFileContent(file.id, { disposition: "inline" })
      .then((blob) => {
        const kind = toPreviewKind(blob.type);
        if (!isCurrent) {
          return;
        }
        if (kind === null) {
          setState({ status: "unsupported" });
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", kind, objectUrl });
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState({ status: "failed", errorTextId: toFilesErrorTextId(error) });
        }
      });
    return () => {
      isCurrent = false;
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file.id, file.mimeType, attempt]);

  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  return { state, retry };
};
