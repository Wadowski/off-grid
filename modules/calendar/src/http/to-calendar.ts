// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarRecord } from "../types.js";

export const toCalendar = (record: CalendarRecord) => ({
  id: record.calendarId,
  name: record.name,
  color: record.color,
  familyId: record.familyId,
  isDefault: record.isDefault,
});
