// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { CalendarColor } from "../../types.js";
import { calendarColorSchema } from "../../domain/calendar-schemas.js";

export const recolorCalendar = async (
  tx: ModuleTransaction,
  input: { readonly calendarId: string; readonly color: CalendarColor },
): Promise<boolean> => {
  const result = await tx.calendar.updateMany({
    where: { calendarId: input.calendarId },
    data: { color: calendarColorSchema.parse(input.color) },
  });
  return result.count > 0;
};
