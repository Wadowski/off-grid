// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const insertEventGuest = async (
  tx: ModuleTransaction,
  input: { readonly eventId: string; readonly guestUserId: string; readonly userId: string },
): Promise<boolean> => {
  const result = await tx.eventGuest.createMany({
    data: [{ eventId: input.eventId, guestUserId: input.guestUserId, userId: input.userId }],
    skipDuplicates: true,
  });
  return result.count === 1;
};
