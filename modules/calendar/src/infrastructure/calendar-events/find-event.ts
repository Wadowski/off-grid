// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarEventRecord } from "../../types.js";
import { toEventRecord } from "./event-record.js";

export const findEvent = async (
  tx: ModuleTransaction,
  eventId: string,
): Promise<CalendarEventRecord | null> => {
  const row = await tx.calendarEvent.findUnique({ where: { eventId } });
  return row === null ? null : toEventRecord(row);
};
