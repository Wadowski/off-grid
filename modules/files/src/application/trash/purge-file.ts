// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import { findAncestors } from "../../infrastructure/files/find-ancestors.js";
import { findFileAnyState } from "../../infrastructure/trash/find-file-any-state.js";
import type { FilesOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { ownerOfVisibleFile } from "../files/owner-of-visible-file.js";
import { NotTrashedError } from "../errors/not-trashed-error.js";
import { purgeTrashedRoot } from "./purge-trashed-root.js";

export const purgeFile = async (
  db: ModuleDatabase,
  storage: FileStorage,
  userId: string,
  fileId: string,
): Promise<FilesOutcome<null>> => {
  const verdict = await readPurgeVerdict(db, userId, fileId);
  if (verdict === "not-found") {
    return { outcome: "not-found" };
  }
  if (verdict === "live") {
    throw new NotTrashedError();
  }
  return purgeTrashedRoot(db, storage, userId, fileId);
};

const readPurgeVerdict = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<"not-found" | "live" | "trashed"> =>
  readAsUser(db, userId, async (tx) => {
    const file = await findFileAnyState(tx, fileId);
    if (file === null) {
      return "not-found";
    }
    if (file.deletedAt === null) {
      return (await ownerOfVisibleFile(tx, file)) === null ? "not-found" : "live";
    }
    return (await findAncestors(tx, file)) === null ? "not-found" : "trashed";
  });
