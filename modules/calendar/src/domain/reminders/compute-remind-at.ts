// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const MINUTE_MS = 60_000;

// The instant a reminder fires: the given number of minutes before the event starts.
export const remindAt = (startsAt: Date, offsetMinutes: number): Date =>
  new Date(startsAt.getTime() - offsetMinutes * MINUTE_MS);

// A reminder is due at its own instant, inclusive: remind_at equal to now is due.
export const isDue = (remindAt: Date, now: Date): boolean => remindAt.getTime() <= now.getTime();

// A reminder set or moved strictly into the past is skipped. One at exactly now is not skipped:
// the next claim fires it.
export const isPast = (remindAt: Date, now: Date): boolean => remindAt.getTime() < now.getTime();
