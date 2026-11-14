// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const WEEK_HOUR_PX = 60;
export const WEEK_GUTTER = "2.25rem";
export const WEEK_MIN_BLOCK_PX = 22;
// Desktop cards shorter than this show the title and time range on one line.
export const WEEK_DETAILED_STACKED_MIN_BLOCK_PX = 56;

export type WeekCardStyle = "compact" | "detailed";

export type WeekGridSize = {
  readonly hourPx: number;
  readonly gutter: string;
  readonly scrollHeight: string;
  readonly scrollFocusable: boolean;
  readonly card: WeekCardStyle;
};

export const PHONE_WEEK_SIZE: WeekGridSize = {
  hourPx: WEEK_HOUR_PX,
  gutter: WEEK_GUTTER,
  scrollHeight: "32rem",
  scrollFocusable: false,
  card: "compact",
};

export const DESKTOP_WEEK_SIZE: WeekGridSize = {
  hourPx: 68,
  gutter: "3.5rem",
  scrollHeight: "40rem",
  scrollFocusable: true,
  card: "detailed",
};
