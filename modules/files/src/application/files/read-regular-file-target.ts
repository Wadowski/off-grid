// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { RegularFileOutcome, RegularFileTarget } from "../../types.js";
import { readAsUser } from "../read-as-user.js";
import { resolveRegularFile } from "./resolve-regular-file.js";

export const readRegularFileTarget = (
  db: ModuleDatabase,
  userId: string,
  fileId: string,
): Promise<RegularFileOutcome<RegularFileTarget>> =>
  readAsUser(db, userId, (tx) => resolveRegularFile(tx, fileId));
