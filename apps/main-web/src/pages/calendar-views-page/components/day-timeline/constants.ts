// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const HOUR_HEIGHT_PX = 88;
export const TIMELINE_TOP_OFFSET_PX = 12;
export const TIMELINE_GUTTER = "3.5rem";
export const MIN_TIMELINE_BLOCK_PX = 64;
export const HOURS_PER_DAY = 24;
// On phone the window scrolls to the first event; this keeps it clear of the fixed app header and the sticky days row.
export const PHONE_STICKY_CLEARANCE_PX = 160;

export const minutesToPx = (minutes: number): number =>
  TIMELINE_TOP_OFFSET_PX + (minutes * HOUR_HEIGHT_PX) / 60;
