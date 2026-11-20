// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteFileRows = async (
  tx: ModuleTransaction,
  fileIds: readonly string[],
): Promise<void> => {
  await tx.filesFile.deleteMany({ where: { fileId: { in: [...fileIds] } } });
};
