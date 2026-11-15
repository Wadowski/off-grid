// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TFunction } from "i18next";

export const WEEKDAY_KEYS = [
  "calendar.mobileViews.weekdayMonday",
  "calendar.mobileViews.weekdayTuesday",
  "calendar.mobileViews.weekdayWednesday",
  "calendar.mobileViews.weekdayThursday",
  "calendar.mobileViews.weekdayFriday",
  "calendar.mobileViews.weekdaySaturday",
  "calendar.mobileViews.weekdaySunday",
] as const;

export const weekdayLetters = (t: TFunction): string[] => WEEKDAY_KEYS.map((key) => t(key));

export const WEEKDAY_SHORT_KEYS = [
  "calendar.mobileViews.weekdayShortMonday",
  "calendar.mobileViews.weekdayShortTuesday",
  "calendar.mobileViews.weekdayShortWednesday",
  "calendar.mobileViews.weekdayShortThursday",
  "calendar.mobileViews.weekdayShortFriday",
  "calendar.mobileViews.weekdayShortSaturday",
  "calendar.mobileViews.weekdayShortSunday",
] as const;

export const weekdayShortLabels = (t: TFunction): string[] =>
  WEEKDAY_SHORT_KEYS.map((key) => t(key));
