// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteCrossEntityLink = async (
  tx: ModuleTransaction,
  linkId: string,
): Promise<boolean> => {
  const result = await tx.relationsCrossEntityLink.deleteMany({ where: { linkId } });
  return result.count === 1;
};
