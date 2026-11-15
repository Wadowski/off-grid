// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findOwnReminderOffsets = async (
  tx: ModuleTransaction,
  eventId: string,
  userId: string,
): Promise<number[]> => {
  const rows = await tx.eventReminder.findMany({
    where: { eventId, userId },
    select: { offsetMinutes: true },
    orderBy: { offsetMinutes: "asc" },
  });
  return rows.map((row) => row.offsetMinutes);
};
