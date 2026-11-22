// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord, FileVersionDependencies, RegularFileOutcome } from "../../types.js";
import { copyFileBytes } from "./copy-file-bytes.js";
import { deleteStoredBytes } from "./delete-stored-bytes.js";
import { readVersionTarget } from "./read-version-target.js";
import { writeRestoredVersion } from "./write-restored-version.js";

export const restoreFileVersion = async (
  dependencies: FileVersionDependencies,
  userId: string,
  fileId: string,
  versionId: string,
): Promise<RegularFileOutcome<FileRecord>> => {
  const { db, storage } = dependencies;
  const source = await readVersionTarget(db, userId, fileId, versionId);
  if (source.outcome !== "found") {
    return source;
  }
  if (source.value.version.versionId === source.value.target.file.currentVersionId) {
    return { outcome: "found", value: source.value.target.file };
  }
  const copy = await copyFileBytes(storage, source.value.version);
  const content = {
    storageKey: copy.key,
    sizeBytes: BigInt(copy.sizeBytes),
    mimeType: source.value.version.mimeType,
    sha256: copy.sha256,
  };
  const outcome = await writeRestoredVersion(db, userId, fileId, versionId, content).catch(
    async (error: unknown) => {
      await deleteStoredBytes(storage, [copy.key]);
      throw error;
    },
  );
  if (outcome.outcome !== "found") {
    await deleteStoredBytes(storage, [copy.key]);
  }
  return outcome;
};
