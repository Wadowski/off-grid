// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { RegularFileOutcome, VersionTarget } from "../../types.js";
import { resolveCurrentVersionTarget } from "./resolve-current-version-target.js";
import { resolveVersionTarget } from "./resolve-version-target.js";

export const resolveContentTarget = (
  tx: ModuleTransaction,
  fileId: string,
  versionId: string | null,
): Promise<RegularFileOutcome<VersionTarget>> =>
  versionId === null
    ? resolveCurrentVersionTarget(tx, fileId)
    : resolveVersionTarget(tx, fileId, versionId);
