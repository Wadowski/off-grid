// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findTimeZone = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<string | null> => {
  const row = await tx.userTimeZone.findUnique({ where: { userId } });
  return row?.timeZone ?? null;
};
