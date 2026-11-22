// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  FileRecord,
  FilesOutcome,
  UploadFileDependencies,
  UploadFileInput,
} from "../../types.js";
import { checkUploadTarget } from "./check-upload-target.js";
import { deleteStoredBytes } from "./delete-stored-bytes.js";
import { recordUploadedFile } from "./record-uploaded-file.js";
import { storeLimitedUpload } from "./store-limited-upload.js";

export const uploadFile = async (
  dependencies: UploadFileDependencies,
  userId: string,
  upload: UploadFileInput,
): Promise<FilesOutcome<FileRecord>> => {
  const { db, storage, maxUploadBytes } = dependencies;
  if (!(await checkUploadTarget(db, userId, upload))) {
    return { outcome: "not-found" };
  }
  const stored = await storeLimitedUpload(storage, maxUploadBytes, upload.body, upload.signal);
  const outcome = await recordUploadedFile(db, userId, { ...upload, stored }).catch(
    async (error: unknown) => {
      await deleteStoredBytes(storage, [stored.key]);
      throw error;
    },
  );
  if (outcome.outcome === "not-found") {
    await deleteStoredBytes(storage, [stored.key]);
  }
  return outcome;
};
