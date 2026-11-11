// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

// The default calendar is never deleted.
export const deleteCalendar = async (
  tx: ModuleTransaction,
  calendarId: string,
): Promise<boolean> => {
  const result = await tx.calendar.deleteMany({ where: { calendarId, isDefault: false } });
  return result.count > 0;
};
