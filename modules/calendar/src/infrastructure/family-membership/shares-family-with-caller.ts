// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const sharesFamilyWithCaller = async (
  tx: ModuleTransaction,
  otherUserId: string,
): Promise<boolean> => {
  const rows = await tx.$queryRaw<{ shares: boolean }[]>`
    SELECT calendar.shares_family_with_caller(${otherUserId}::uuid) AS shares
  `;
  return rows[0]?.shares === true;
};
