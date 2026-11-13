// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findGuestEventIds = async (
  tx: ModuleTransaction,
  eventIds: readonly string[],
): Promise<Set<string>> => {
  const rows = await tx.eventGuest.findMany({
    where: { eventId: { in: [...eventIds] } },
    select: { eventId: true },
  });
  return new Set(rows.map((row) => row.eventId));
};
