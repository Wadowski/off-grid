// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useRef, useState } from "react";
import { getFileContent } from "./files-api.js";
import { saveBlobAsFile } from "./save-blob-as-file.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type {
  FileDownload,
  FileDownloadStatus,
  FilesErrorTextId,
  RegularFileEntry,
} from "./types.js";

export const useFileDownload = (file: RegularFileEntry): FileDownload => {
  const [status, setStatus] = useState<FileDownloadStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const isRunning = useRef(false);

  const download = useCallback(async () => {
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    setStatus("downloading");
    setErrorTextId(null);
    try {
      saveBlobAsFile(await getFileContent(file.id, { disposition: "attachment" }), file.name);
      setStatus("idle");
    } catch (error) {
      setErrorTextId(toFilesErrorTextId(error));
      setStatus("failed");
    } finally {
      isRunning.current = false;
    }
  }, [file.id, file.name]);

  return { status, errorTextId, download };
};
