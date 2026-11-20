// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { subtreeFingerprint } from "../../domain/files/subtree-fingerprint.js";
import { findLiveFile } from "../../infrastructure/files/find-file.js";
import { findSubtree } from "../../infrastructure/files/find-subtree.js";
import type { CrossOwnerPlan } from "../../types.js";
import { InvalidMoveError } from "../errors/invalid-move-error.js";

export const assertSourceUnchanged = async (
  tx: ModuleTransaction,
  plan: CrossOwnerPlan,
): Promise<void> => {
  const root = await findLiveFile(tx, plan.file.fileId);
  const current = root === null ? null : await findSubtree(tx, root);
  if (current === null) {
    throw new InvalidMoveError();
  }
  const unchanged =
    subtreeFingerprint(current).join("\n") === subtreeFingerprint(plan.tree.entries).join("\n");
  if (!unchanged) {
    throw new InvalidMoveError();
  }
};
