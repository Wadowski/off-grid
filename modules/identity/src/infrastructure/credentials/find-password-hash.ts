// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findPasswordHash = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<string | null> => {
  const credential = await tx.credential.findUnique({
    where: { userId },
    select: { passwordHash: true },
  });
  return credential?.passwordHash ?? null;
};
