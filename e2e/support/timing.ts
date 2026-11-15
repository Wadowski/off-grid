// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const ONE_HOUR_MS = 60 * 60 * 1000;
export const MEMBER_READY_TIMEOUT_MS = 10_000;
export const MEMBER_READY_INTERVAL_MS = 200;

export const instantOfDate = (date: string, time: string): string => `${date}T${time}:00Z`;
