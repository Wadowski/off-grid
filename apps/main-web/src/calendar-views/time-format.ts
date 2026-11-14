// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { zonedParts } from "@offgrid/contracts";

export const UTC_TIME_ZONE = "UTC";

export type ZonedMoment = { readonly date: string; readonly minutesOfDay: number };

const twoDigits = (value: number): string => String(value).padStart(2, "0");

export const zonedMomentOf = (instant: string | Date, timeZone: string): ZonedMoment => {
  const parts = zonedParts(new Date(instant), timeZone);
  return {
    date: `${parts.year}-${twoDigits(parts.month)}-${twoDigits(parts.day)}`,
    minutesOfDay: parts.hour * 60 + parts.minute,
  };
};

const CLOCK = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: UTC_TIME_ZONE,
});

export const formatClockTime = (instant: string, timeZone: string): string =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(instant));

export const formatHourLabel = (hour: number): string =>
  CLOCK.format(new Date(Date.UTC(2000, 0, 1, hour)));

export const durationMinutes = (startsAt: string, endsAt: string): number =>
  Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60_000);

const DAY_HEADING = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: UTC_TIME_ZONE,
});

export const formatDayHeading = (date: string): string =>
  DAY_HEADING.format(new Date(`${date}T00:00:00Z`));

const GMT_OFFSET = /GMT([+-])(\d{2}):(\d{2})/;

export const formatGmtOffset = (date: string, timeZone: string): string => {
  const noon = new Date(`${date}T12:00:00Z`);
  const named = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(noon)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = named === undefined ? null : GMT_OFFSET.exec(named);
  if (match === null) {
    return "+0";
  }
  const [, sign = "+", hours = "00", minutes = "00"] = match;
  const hourText = String(Number(hours));
  return minutes === "00" ? `${sign}${hourText}` : `${sign}${hourText}:${minutes}`;
};
