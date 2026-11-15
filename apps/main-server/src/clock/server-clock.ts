// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export interface ServerClock {
  now(): Date;
  readonly pollIntervalMs: number;
}

const PRODUCTION_POLL_MS = 30_000;

export const createServerClock = (): ServerClock => ({
  now: () => new Date(),
  pollIntervalMs: PRODUCTION_POLL_MS,
});
