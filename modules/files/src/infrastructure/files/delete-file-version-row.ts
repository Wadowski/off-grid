// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteFileVersionRow = async (
  tx: ModuleTransaction,
  fileId: string,
  versionId: string,
): Promise<void> => {
  await tx.filesFileVersion.deleteMany({ where: { fileId, versionId } });
};
