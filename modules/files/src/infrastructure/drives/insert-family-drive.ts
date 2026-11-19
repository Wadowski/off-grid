// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { FamilyDriveInsertInput } from "../../types.js";

export const insertFamilyDrive = async (
  tx: ModuleTransaction,
  input: FamilyDriveInsertInput,
): Promise<number> => {
  const { count } = await tx.filesDrive.createMany({
    data: [{ driveId: input.driveId, familyId: input.familyId, kind: "family", name: input.name }],
    skipDuplicates: true,
  });
  return count;
};
