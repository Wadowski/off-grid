// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { listFileVersionRows } from "../../infrastructure/files/list-file-version-rows.js";
import type { FileVersionSummary, RegularFileOutcome } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { resolveRegularFile } from "./resolve-regular-file.js";

export const listFileVersions = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<RegularFileOutcome<FileVersionSummary[]>> =>
  readAsUser(db, userId, async (tx) => {
    const target = await resolveRegularFile(tx, fileId);
    if (target.outcome !== "found") {
      return target;
    }
    return { outcome: "found", value: await listFileVersionRows(tx, fileId) };
  });
