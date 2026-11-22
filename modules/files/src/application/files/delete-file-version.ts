// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CurrentVersionError } from "../errors/current-version-error.js";
import { deleteFileVersionRow } from "../../infrastructure/files/delete-file-version-row.js";
import type {
  FileVersionDependencies,
  FileVersionRecord,
  RegularFileOutcome,
} from "../../types.js";
import { deleteStoredBytes } from "./delete-stored-bytes.js";
import { resolveVersionTarget } from "./resolve-version-target.js";
import { writeAsUser } from "../write-as-user.js";

export const deleteFileVersion = async (
  dependencies: FileVersionDependencies,
  userId: string,
  fileId: string,
  versionId: string,
): Promise<RegularFileOutcome<FileVersionRecord>> => {
  const { db, storage } = dependencies;
  const removed = await writeAsUser<RegularFileOutcome<FileVersionRecord>>(
    db,
    userId,
    async (tx) => {
      const source = await resolveVersionTarget(tx, fileId, versionId);
      if (source.outcome !== "found") {
        return source;
      }
      if (source.value.version.versionId === source.value.target.file.currentVersionId) {
        throw new CurrentVersionError();
      }
      await deleteFileVersionRow(tx, fileId, versionId);
      return { outcome: "found", value: source.value.version };
    },
  );
  if (removed.outcome === "found") {
    await deleteStoredBytes(storage, [removed.value.storageKey]);
  }
  return removed;
};
