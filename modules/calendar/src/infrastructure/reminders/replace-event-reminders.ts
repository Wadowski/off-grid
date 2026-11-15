// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { isPast, remindAt } from "../../domain/reminders/compute-remind-at.js";

export interface ReplaceEventRemindersInput {
  readonly eventId: string;
  readonly familyId: string | null;
  readonly userId: string;
  readonly startsAt: Date;
  readonly offsetsMinutes: readonly number[];
  readonly now: Date;
}

// Reconciles the caller's reminder rows for one event with the offsets they now want. Runs in
// the same transaction as the event change. Only the caller's rows are touched (RLS allows
// nothing else); a row whose time did not change keeps its fired or skipped state.
export const replaceEventReminders = async (
  tx: ModuleTransaction,
  input: ReplaceEventRemindersInput,
): Promise<void> => {
  const { eventId, familyId, userId, startsAt, offsetsMinutes, now } = input;
  const existing = await tx.eventReminder.findMany({ where: { eventId, userId } });
  const byOffset = new Map(existing.map((row) => [row.offsetMinutes, row]));

  for (const offsetMinutes of offsetsMinutes) {
    const at = remindAt(startsAt, offsetMinutes);
    const skippedAt = isPast(at, now) ? now : null;
    const row = byOffset.get(offsetMinutes);
    if (row === undefined) {
      await tx.eventReminder.create({
        data: {
          reminderId: randomUUID(),
          eventId,
          familyId,
          userId,
          offsetMinutes,
          remindAt: at,
          skippedAt,
        },
      });
    } else if (row.remindAt.getTime() !== at.getTime()) {
      await tx.eventReminder.update({
        where: { reminderId: row.reminderId },
        data: { remindAt: at, firedAt: null, skippedAt },
      });
    }
  }

  await tx.eventReminder.deleteMany({
    where: { eventId, userId, offsetMinutes: { notIn: [...offsetsMinutes] } },
  });
};
