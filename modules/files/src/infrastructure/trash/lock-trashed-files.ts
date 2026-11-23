// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const lockTrashedFiles = async (
  tx: ModuleTransaction,
  fileIds: readonly string[],
): Promise<Set<string>> => {
  const trashed = { fileId: { in: [...fileIds] }, deletedAt: { not: null } };
  await tx.filesFile.updateMany({ where: trashed, data: { updatedAt: new Date() } });
  const rows = await tx.filesFile.findMany({ where: trashed, select: { fileId: true } });
  return new Set(rows.map((row) => row.fileId));
};
