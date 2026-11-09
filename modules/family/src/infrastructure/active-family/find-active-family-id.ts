// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findActiveFamilyId = async (
  tx: ModuleTransaction,
  sessionId: string,
): Promise<string | null> => {
  const selection = await tx.familyActiveFamily.findUnique({ where: { sessionId } });
  return selection?.familyId ?? null;
};
