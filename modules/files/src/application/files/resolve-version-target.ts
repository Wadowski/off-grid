// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findFileVersion } from "../../infrastructure/files/find-file-version.js";
import type { RegularFileOutcome, VersionTarget } from "../../types.js";
import { resolveRegularFile } from "./resolve-regular-file.js";

export const resolveVersionTarget = async (
  tx: ModuleTransaction,
  fileId: string,
  versionId: string,
): Promise<RegularFileOutcome<VersionTarget>> => {
  const target = await resolveRegularFile(tx, fileId);
  if (target.outcome !== "found") {
    return target;
  }
  const version = await findFileVersion(tx, fileId, versionId);
  if (version === null) {
    return { outcome: "not-found" };
  }
  return { outcome: "found", value: { target: target.value, version } };
};
