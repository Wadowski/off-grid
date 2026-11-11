// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarColor } from "../../domain/calendar-colors.js";
import { calendarColorSchema, calendarNameSchema } from "../../domain/calendar-schemas.js";

interface NewCalendar {
  readonly calendarId: string;
  readonly familyId?: string;
  readonly userId?: string;
  readonly name: string;
  readonly color: CalendarColor;
}

export const insertCalendar = async (tx: ModuleTransaction, input: NewCalendar): Promise<void> => {
  await tx.calendar.create({
    data: {
      calendarId: input.calendarId,
      familyId: input.familyId,
      userId: input.userId,
      name: calendarNameSchema.parse(input.name),
      color: calendarColorSchema.parse(input.color),
    },
  });
};
