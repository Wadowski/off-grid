// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MILLISECONDS_PER_DAY } from "./constants.js";
import type { CalendarDay } from "./types.js";

const toUtcDay = ({ year, month, day }: CalendarDay): number => Date.UTC(year, month - 1, day);

export const calendarDayDifference = (later: CalendarDay, earlier: CalendarDay): number =>
  Math.round((toUtcDay(later) - toUtcDay(earlier)) / MILLISECONDS_PER_DAY);
