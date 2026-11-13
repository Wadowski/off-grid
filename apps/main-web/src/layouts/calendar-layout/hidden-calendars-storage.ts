// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  type HiddenCalendars,
  NO_HIDDEN_CALENDARS,
} from "../../calendar-views/events-by-calendar.js";

// Stores only the ids of the calendars a person hid. The browser keeps them; nothing is sent anywhere.
export const HIDDEN_CALENDARS_KEY = "offgrid.calendar.hiddenCalendars";

// Bounds keep an oversized stored value from being parsed in full on every mount.
const MAX_HIDDEN_CALENDARS = 500;
const MAX_CALENDAR_ID_LENGTH = 100;
const hiddenCalendarIdsSchema = z
  .array(z.string().max(MAX_CALENDAR_ID_LENGTH))
  .max(MAX_HIDDEN_CALENDARS);

// Returns "all calendars shown" when the stored value is missing, invalid or unreadable.
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

// A write that the browser refuses is ignored: the choice then lasts until the page reloads.
export const writeHiddenCalendars = (hidden: HiddenCalendars): void => {
  try {
    window.localStorage.setItem(HIDDEN_CALENDARS_KEY, JSON.stringify([...hidden]));
  } catch {
    // The browser blocked storage; the in-memory choice still applies.
  }
};
