// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export interface ClaimedReminder {
  readonly reminderId: string;
  readonly eventId: string;
  readonly userId: string | null;
}

interface ClaimRow {
  readonly reminder_id: string;
  readonly event_id: string;
  readonly user_id: string | null;
}

// Calls the SECURITY DEFINER function that marks due reminders as fired and returns their ids.
// The function is the only cross-user read the worker makes (ADR 0030). It runs in the caller's
// transaction, so a rollback also unmarks the rows.
export const claimDueReminders = async (
  tx: ModuleTransaction,
  now: Date,
  batch: number,
): Promise<ClaimedReminder[]> => {
  const rows = await tx.$queryRaw<ClaimRow[]>`
    SELECT reminder_id, event_id, user_id
    FROM calendar.claim_due_reminders(${now}::timestamptz, ${batch}::integer)`;
  return rows.map((row) => ({
    reminderId: row.reminder_id,
    eventId: row.event_id,
    userId: row.user_id,
  }));
};
