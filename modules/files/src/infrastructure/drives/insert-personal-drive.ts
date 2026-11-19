// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { PersonalDriveInsertInput } from "../../types.js";

export const insertPersonalDrive = async (
  tx: ModuleTransaction,
  input: PersonalDriveInsertInput,
): Promise<number> => {
  const { count } = await tx.filesDrive.createMany({
    data: [{ driveId: input.driveId, userId: input.userId, kind: "personal", name: input.name }],
    skipDuplicates: true,
  });
  return count;
};
