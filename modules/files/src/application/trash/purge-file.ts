// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import type { FileRecord, FilesOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { ownerOfVisibleFile } from "../files/owner-of-visible-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";
import { assertTrashed } from "./assert-trashed.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";

export const purgeFile = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  fileId: string,
): Promise<FilesOutcome<null>> => {
  const target = await readVisibleTarget(db, userId, fileId);
  if (target === null) {
    return { outcome: "not-found" };
  }
  assertTrashed(target);
  const outcome = await purgeTrashedRoot(db, storage, userId, fileId);
  if (outcome.outcome === "restored") {
    throw new NotTrashedError();
  }
  return outcome;
};

const readVisibleTarget = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<FileRecord | null> =>
  readAsUser(db, userId, async (tx) => {
    const file = await findFileAnyState(tx, fileId);
    if (file === null) {
      return null;
    }
    const visible =
      file.deletedAt === null ? await ownerOfVisibleFile(tx, file) : await findAncestors(tx, file);
    return visible === null ? null : file;
  });
