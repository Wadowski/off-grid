// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlyTime } from "../types.js";

export const nightlySlotOnDay = (day: Date, time: NightlyTime, dayOffset: number): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate() + dayOffset, time.hour, time.minute);
