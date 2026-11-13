// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedMomentOf } from "../calendar-views/time-format.js";

const MINUTE_MS = 60_000;

// The offset of a time zone at an instant, in milliseconds (wall clock minus instant).
const zoneOffsetMs = (instantMs: number, timeZone: string): number => {
  const moment = zonedMomentOf(new Date(instantMs), timeZone);
  const wall = Date.parse(`${moment.date}T00:00:00Z`) + moment.minutesOfDay * MINUTE_MS;
  return wall - Math.floor(instantMs / MINUTE_MS) * MINUTE_MS;
};

// Converts a local date ("YYYY-MM-DD") and time ("HH:mm") in a time zone to a UTC instant in ISO 8601.
// Returns undefined when the date or time is not complete. Two passes handle a date on which the
// zone's offset changes, such as a daylight-saving switch.
export const localToInstant = (
  date: string,
  time: string,
  timeZone: string,
): string | undefined => {
  const wall = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(wall)) {
    return undefined;
  }
  const firstGuess = wall - zoneOffsetMs(wall, timeZone);
  return new Date(wall - zoneOffsetMs(firstGuess, timeZone)).toISOString();
};
