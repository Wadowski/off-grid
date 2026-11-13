// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findGuestEventIds = async (
  tx: ModuleTransaction,
  input: { readonly guestUserId: string; readonly eventIds: readonly string[] },
): Promise<Set<string>> => {
  const rows = await tx.eventGuest.findMany({
    where: { guestUserId: input.guestUserId, eventId: { in: [...input.eventIds] } },
    select: { eventId: true },
  });
  return new Set(rows.map((row) => row.eventId));
};
