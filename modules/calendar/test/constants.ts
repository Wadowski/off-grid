// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE calendar.event_reminder, calendar.event_guest, calendar.calendar_event,
  calendar.location, calendar.calendar RESTART IDENTITY CASCADE`;
