// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlyTime } from "../types.js";
import { nightlySlotOnDay } from "./nightly-slot-on-day.js";

export const nextNightlyRunAt = (after: Date, time: NightlyTime): Date => {
  const slotToday = nightlySlotOnDay(after, time, 0);
  return slotToday.getTime() > after.getTime() ? slotToday : nightlySlotOnDay(after, time, 1);
};
