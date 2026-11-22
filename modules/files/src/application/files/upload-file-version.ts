// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type {
  FileRecord,
  RegularFileOutcome,
  UploadFileDependencies,
  UploadFileVersionInput,
} from "../../types.js";
import { deleteStoredBytes } from "./delete-stored-bytes.js";
import { readRegularFileTarget } from "./read-regular-file-target.js";
import { recordFileVersion } from "./record-file-version.js";
import { storeLimitedUpload } from "./store-limited-upload.js";

export const uploadFileVersion = async (
  dependencies: UploadFileDependencies,
  userId: string,
  upload: UploadFileVersionInput,
): Promise<RegularFileOutcome<FileRecord>> => {
  const { db, storage, maxUploadBytes } = dependencies;
  const target = await readRegularFileTarget(db, userId, upload.fileId);
  if (target.outcome !== "found") {
    return target;
  }
  const stored = await storeLimitedUpload(storage, maxUploadBytes, upload.body, upload.signal);
  const outcome = await recordFileVersion(db, {
    fileId: upload.fileId,
    userId,
    declaredMimeType: upload.declaredMimeType,
    stored,
  }).catch(async (error: unknown) => {
    await deleteStoredBytes(storage, [stored.key]);
    throw error;
  });
  if (outcome.outcome !== "found") {
    await deleteStoredBytes(storage, [stored.key]);
  }
  return outcome;
};
