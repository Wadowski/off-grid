// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileRecord, NewVersionContent, RegularFileOutcome } from "../../types.js";
import { writeAsUser } from "../write-as-user.js";
import { appendFileVersion } from "./append-file-version.js";
import { resolveVersionTarget } from "./resolve-version-target.js";

export const writeRestoredVersion = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
  versionId: string,
  copy: NewVersionContent,
): Promise<RegularFileOutcome<FileRecord>> =>
  writeAsUser(db, userId, async (tx) => {
    const source = await resolveVersionTarget(tx, fileId, versionId);
    if (source.outcome !== "found") {
      return source;
    }
    return appendFileVersion(tx, {
      target: source.value.target,
      createdByUserId: userId,
      content: copy,
    });
  });
