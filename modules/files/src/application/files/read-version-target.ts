// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { RegularFileOutcome, VersionTarget } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { resolveVersionTarget } from "./resolve-version-target.js";

export const readVersionTarget = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
  versionId: string,
): Promise<RegularFileOutcome<VersionTarget>> =>
  readAsUser(db, userId, (tx) => resolveVersionTarget(tx, fileId, versionId));
