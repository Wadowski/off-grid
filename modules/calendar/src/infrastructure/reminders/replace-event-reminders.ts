// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { isPast, remindAt } from "../../domain/reminders/compute-remind-at.js";

interface ReplaceEventRemindersInput {
  readonly eventId: string;
  readonly userId: string;
  readonly startsAt: Date;
  readonly offsetsMinutes: readonly number[];
  readonly now: Date;
}

export const replaceEventReminders = async (
  tx: ModuleTransaction,
  input: ReplaceEventRemindersInput,
): Promise<void> => {
  const { eventId, userId, startsAt, offsetsMinutes, now } = input;
  const existing = await tx.eventReminder.findMany({ where: { eventId, userId } });
  const byOffset = new Map(existing.map((row) => [row.offsetMinutes, row]));

  for (const offsetMinutes of offsetsMinutes) {
    const reminderAt = remindAt(startsAt, offsetMinutes);
    const skippedAt = isPast(reminderAt, now) ? now : null;
    const row = byOffset.get(offsetMinutes);
    if (row === undefined) {
      await tx.eventReminder.create({
        data: {
          reminderId: randomUUID(),
          eventId,
          userId,
          offsetMinutes,
          remindAt: reminderAt,
          skippedAt,
        },
      });
    } else if (row.remindAt.getTime() !== reminderAt.getTime()) {
      await tx.eventReminder.update({
        where: { reminderId: row.reminderId },
        data: { remindAt: reminderAt, firedAt: null, skippedAt },
      });
    }
  }

  await tx.eventReminder.deleteMany({
    where: { eventId, userId, offsetMinutes: { notIn: [...offsetsMinutes] } },
  });
};
