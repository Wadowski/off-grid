// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const MINUTE_MS = 60_000;

export const remindAt = (startsAt: Date, offsetMinutes: number): Date =>
  new Date(startsAt.getTime() - offsetMinutes * MINUTE_MS);

export const isPast = (reminderAt: Date, now: Date): boolean =>
  reminderAt.getTime() < now.getTime();
