// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withUserContext, type ModuleTransaction } from "@offgrid/db";
import { insertDefaultCalendar } from "../../infrastructure/calendars/insert-default-calendar.js";

export const createDefaultCalendar = async (
  tx: ModuleTransaction,
  userId: string,
): Promise<void> => {
  await withUserContext(tx, userId);
  await insertDefaultCalendar(tx, { calendarId: randomUUID(), userId });
};
