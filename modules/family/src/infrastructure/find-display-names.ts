// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findDisplayNames = async (
  tx: ModuleTransaction,
  userIds: readonly string[],
): Promise<Map<string, string>> => {
  const profiles = await tx.familyUserProfile.findMany({
    where: { userId: { in: [...userIds] } },
    select: { userId: true, displayName: true },
  });
  return new Map(profiles.map((profile) => [profile.userId, profile.displayName]));
};
