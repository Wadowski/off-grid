// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { RegularFileOutcome, VersionTarget } from "../../types.js";
import { resolveRegularFile } from "./resolve-regular-file.js";
import { resolveVersionTarget } from "./resolve-version-target.js";

export const resolveCurrentVersionTarget = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<RegularFileOutcome<VersionTarget>> => {
  const target = await resolveRegularFile(tx, fileId);
  if (target.outcome !== "found") {
    return target;
  }
  const currentVersionId = target.value.file.currentVersionId;
  if (currentVersionId === null) {
    return { outcome: "not-found" };
  }
  return resolveVersionTarget(tx, fileId, currentVersionId);
};
