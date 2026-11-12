// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarEventCreatedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";
import type { CalendarEventRecord } from "../../types.js";
import { toCalendarEventPayload } from "./calendar-event-payload.js";

export const publishCalendarEventCreated = (
  tx: ModuleTransaction,
  record: CalendarEventRecord,
): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    calendarEventCreatedV1,
    { familyId: record.familyId, userId: record.userId, sourceVersion: record.version },
    toCalendarEventPayload(record),
  );
