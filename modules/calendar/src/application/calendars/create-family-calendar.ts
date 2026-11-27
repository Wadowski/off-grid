// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, type ModuleTransaction } from "@offgrid/db";
import { insertFamilyDefaultCalendar } from "../../infrastructure/calendars/insert-family-default-calendar.js";

export const createFamilyCalendar = async (
  tx: ModuleTransaction,
  familyId: string,
  familyName: string,
): Promise<void> => {
  await withFamilyContext(tx, familyId);
  await insertFamilyDefaultCalendar(tx, { calendarId: randomUUID(), familyId, name: familyName });
};
