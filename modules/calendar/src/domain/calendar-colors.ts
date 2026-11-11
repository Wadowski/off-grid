// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const CALENDAR_COLORS = ["blue", "teal", "green", "amber", "rose", "violet"] as const;

export type CalendarColor = (typeof CALENDAR_COLORS)[number];
