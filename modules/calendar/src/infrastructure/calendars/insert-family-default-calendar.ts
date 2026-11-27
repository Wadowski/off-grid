// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { DEFAULT_CALENDAR_COLOR } from "../../domain/default-calendar.js";
import type { FamilyCalendarInsertInput } from "../../types.js";

export const insertFamilyDefaultCalendar = async (
  tx: ModuleTransaction,
  input: FamilyCalendarInsertInput,
): Promise<void> => {
  await tx.calendar.createMany({
    data: [
      {
        calendarId: input.calendarId,
        familyId: input.familyId,
        name: input.name,
        color: DEFAULT_CALENDAR_COLOR,
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });
};
