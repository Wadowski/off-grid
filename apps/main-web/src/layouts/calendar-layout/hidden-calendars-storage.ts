// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  type HiddenCalendars,
  NO_HIDDEN_CALENDARS,
} from "../../calendar-views/events-by-calendar.js";

export const HIDDEN_CALENDARS_KEY = "offgrid.calendar.hiddenCalendars";

const MAX_HIDDEN_CALENDARS = 500;
const MAX_CALENDAR_ID_LENGTH = 100;
const hiddenCalendarIdsSchema = z
  .array(z.string().max(MAX_CALENDAR_ID_LENGTH))
  .max(MAX_HIDDEN_CALENDARS);

export const readHiddenCalendars = (): HiddenCalendars => {
  try {
    const raw = window.localStorage.getItem(HIDDEN_CALENDARS_KEY);
    if (raw === null) {
      return NO_HIDDEN_CALENDARS;
    }
    const parsed = hiddenCalendarIdsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? new Set(parsed.data) : NO_HIDDEN_CALENDARS;
  } catch {
    return NO_HIDDEN_CALENDARS;
  }
};

export const writeHiddenCalendars = (hidden: HiddenCalendars): void => {
  try {
    window.localStorage.setItem(HIDDEN_CALENDARS_KEY, JSON.stringify([...hidden]));
  } catch {
    return;
  }
};
