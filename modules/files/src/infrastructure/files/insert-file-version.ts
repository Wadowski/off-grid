// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewFileVersionInput } from "../../types.js";

export const insertFileVersion = async (
  tx: ModuleTransaction,
  input: NewFileVersionInput,
): Promise<void> => {
  await tx.filesFileVersion.create({
    data: {
      versionId: input.versionId,
      fileId: input.fileId,
      userId: input.owner.userId,
      familyId: input.owner.familyId,
      number: input.number,
      storageKey: input.storageKey,
      sizeBytes: input.sizeBytes,
      mimeType: input.mimeType,
      sha256: input.sha256,
      createdByUserId: input.createdByUserId,
    },
  });
};
