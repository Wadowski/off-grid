// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase } from "@offgrid/db";
import { listCalendars } from "../../infrastructure/calendars/list-calendars.js";
import type { CalendarRecord } from "../../types.js";

export const listCalendarsFor = (db: ModuleDatabase, userId: string): Promise<CalendarRecord[]> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return listCalendars(tx);
  });
