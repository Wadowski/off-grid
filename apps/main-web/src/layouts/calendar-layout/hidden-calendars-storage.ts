// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  type HiddenCalendars,
  NO_HIDDEN_CALENDARS,
} from "../../calendar-views/events-by-calendar.js";
import { readLocalStorageJson } from "../../local-storage/read-local-storage-json.js";
import { writeLocalStorageJson } from "../../local-storage/write-local-storage-json.js";

export const HIDDEN_CALENDARS_KEY = "offgrid.calendar.hiddenCalendars";

const MAX_HIDDEN_CALENDARS = 500;
const MAX_CALENDAR_ID_LENGTH = 100;
const hiddenCalendarIdsSchema = z
  .array(z.string().max(MAX_CALENDAR_ID_LENGTH))
  .max(MAX_HIDDEN_CALENDARS);

export const readHiddenCalendars = (): HiddenCalendars => {
  const ids = readLocalStorageJson(HIDDEN_CALENDARS_KEY, hiddenCalendarIdsSchema);
  return ids === null ? NO_HIDDEN_CALENDARS : new Set(ids);
};

export const writeHiddenCalendars = (hidden: HiddenCalendars): void => {
  writeLocalStorageJson(HIDDEN_CALENDARS_KEY, [...hidden]);
};
