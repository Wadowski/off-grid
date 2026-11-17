// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MILLISECONDS_PER_DAY } from "../constants.js";
import { toUtcDay } from "./to-utc-day.js";
import type { CalendarDay } from "./types.js";

export const calendarDayDifference = (later: CalendarDay, earlier: CalendarDay): number =>
  Math.round((toUtcDay(later) - toUtcDay(earlier)) / MILLISECONDS_PER_DAY);
