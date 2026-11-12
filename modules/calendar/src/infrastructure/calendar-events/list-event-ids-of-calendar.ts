// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const listEventIdsOfCalendar = async (
  tx: ModuleTransaction,
  calendarId: string,
): Promise<string[]> => {
  const events = await tx.calendarEvent.findMany({
    where: { calendarId },
    select: { eventId: true },
  });
  return events.map((event) => event.eventId);
};
