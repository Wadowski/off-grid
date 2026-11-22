// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import type { RegularFileOutcome, RegularFileTarget } from "../../types.js";
import { ownerOfVisibleFile } from "./owner-of-visible-file.js";

export const resolveRegularFile = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<RegularFileOutcome<RegularFileTarget>> => {
  const file = await findLiveFile(tx, fileId);
  if (file === null) {
    return { outcome: "not-found" };
  }
  const owner = await ownerOfVisibleFile(tx, file);
  if (owner === null) {
    return { outcome: "not-found" };
  }
  if (file.isFolder) {
    return { outcome: "folder" };
  }
  return { outcome: "found", value: { file, owner } };
};
