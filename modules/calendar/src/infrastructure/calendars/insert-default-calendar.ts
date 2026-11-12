// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { DEFAULT_CALENDAR_COLOR, DEFAULT_CALENDAR_NAME } from "../../domain/default-calendar.js";

export const insertDefaultCalendar = async (
  tx: ModuleTransaction,
  input: { readonly calendarId: string; readonly userId: string },
): Promise<void> => {
  await tx.calendar.createMany({
    data: [
      {
        calendarId: input.calendarId,
        userId: input.userId,
        name: DEFAULT_CALENDAR_NAME,
        color: DEFAULT_CALENDAR_COLOR,
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });
};
