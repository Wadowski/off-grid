// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useState } from "react";
import { createFolder } from "./create-folder.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import type {
  CreateFolderState,
  CreateFolderStatus,
  Drive,
  FileEntry,
  FilesErrorTextId,
} from "./types.js";

export const useCreateFolder = (
  driveId: Drive["id"] | null,
  parentId: FileEntry["id"] | null,
): CreateFolderState => {
  const [status, setStatus] = useState<CreateFolderStatus>("idle");
  const [errorTextId, setErrorTextId] = useState<FilesErrorTextId | null>(null);

  const create = useCallback(
    async (name: string): Promise<FileEntry | null> => {
      if (driveId === null) {
        return null;
      }
      setStatus("submitting");
      setErrorTextId(null);
      try {
        const entry = await createFolder(driveId, parentId, name);
        setStatus("idle");
        return entry;
      } catch (error) {
        setErrorTextId(toFilesErrorTextId(error));
        setStatus("failed");
        return null;
      }
    },
    [driveId, parentId],
  );

  return { status, errorTextId, create };
};
