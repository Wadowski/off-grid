// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarReminderDueV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";

export const publishCalendarReminderDue = (
  tx: ModuleTransaction,
  input: { readonly eventId: string; readonly userId: string },
): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    calendarReminderDueV1,
    { familyId: null, userId: input.userId },
    { eventId: input.eventId, userId: input.userId },
  );
