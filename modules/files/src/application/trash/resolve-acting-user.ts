// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { withFilesTrashPurgeContext } from "@offgrid/db";
import { findActingMember } from "../../infrastructure/trash/find-acting-member.js";
import type { ExpiredRoot } from "../../types.js";

export const resolveActingUser = async (
  db: ModuleDatabase,
  root: ExpiredRoot,
): Promise<string | null> => {
  if (root.ownerUserId !== null) {
    return root.ownerUserId;
  }
  if (root.ownerFamilyId === null) {
    return null;
  }
  const familyId = root.ownerFamilyId;
  return db.$transaction(async (tx) => {
    await withFilesTrashPurgeContext(tx);
    return findActingMember(tx, familyId);
  });
};
