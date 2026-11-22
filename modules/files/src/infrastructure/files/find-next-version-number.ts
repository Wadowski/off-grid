// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findNextVersionNumber = async (
  tx: ModuleTransaction,
  fileId: string,
): Promise<number> => {
  const { _max } = await tx.filesFileVersion.aggregate({
    where: { fileId },
    _max: { number: true },
  });
  return (_max.number ?? 0) + 1;
};
