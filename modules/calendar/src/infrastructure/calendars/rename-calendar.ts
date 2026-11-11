// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { calendarNameSchema } from "../../domain/calendar-schemas.js";

export const renameCalendar = async (
  tx: ModuleTransaction,
  input: { readonly calendarId: string; readonly name: string },
): Promise<boolean> => {
  const result = await tx.calendar.updateMany({
    where: { calendarId: input.calendarId },
    data: { name: calendarNameSchema.parse(input.name) },
  });
  return result.count > 0;
};
