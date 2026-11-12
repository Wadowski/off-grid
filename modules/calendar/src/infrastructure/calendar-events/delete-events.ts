// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteEvents = async (
  tx: ModuleTransaction,
  eventIds: readonly string[],
): Promise<void> => {
  const where = { in: [...eventIds] };
  await tx.eventReminder.deleteMany({ where: { eventId: where } });
  await tx.eventGuest.deleteMany({ where: { eventId: where } });
  await tx.calendarEvent.deleteMany({ where: { eventId: where } });
};
