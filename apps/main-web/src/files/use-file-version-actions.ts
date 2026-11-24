// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { deleteFileVersion, restoreFileVersion } from "./files-api.js";
import { downloadFileVersion } from "./download-file-version.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type {
  FileEntry,
  FileVersion,
  FileVersionActionsState,
  FileVersionCompletion,
  FilesErrorTextId,
} from "./types.js";

export const useFileVersionActions = (
  fileId: FileEntry["id"],
  onChanged: () => void,
): FileVersionActionsState => {
  const [pendingVersionId, setPendingVersionId] = useState<FileVersion["id"] | null>(null);
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);
  const [completed, setCompleted] = useState<FileVersionCompletion | null>(null);

  const runAction = useCallback(
    async (
      version: FileVersion,
      kind: FileVersionCompletion["kind"],
      operation: () => Promise<void>,
    ) => {
      setPendingVersionId(version.id);
      setErrorTextId(null);
      setCompleted(null);
      try {
        await operation();
        setCompleted({ kind, versionNumber: version.number });
        if (kind !== "downloaded") {
          onChanged();
        }
      } catch (error) {
        setErrorTextId(toFilesErrorTextId(error));
      } finally {
        setPendingVersionId(null);
      }
    },
    [onChanged],
  );

  const restore = useCallback(
    (version: FileVersion) =>
      runAction(version, "restored", async () => {
        await restoreFileVersion(fileId, version.id);
      }),
    [fileId, runAction],
  );

  const remove = useCallback(
    (version: FileVersion) =>
      runAction(version, "deleted", async () => {
        await deleteFileVersion(fileId, version.id);
      }),
    [fileId, runAction],
  );

  const download = useCallback(
    (version: FileVersion, fileName: string) =>
      runAction(version, "downloaded", async () => {
        await downloadFileVersion(fileId, version.id, fileName);
      }),
    [fileId, runAction],
  );

  return { pendingVersionId, errorTextId, completed, restore, remove, download };
};
