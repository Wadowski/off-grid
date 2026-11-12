// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webCalendarClient } from "../api/web-api-client.js";
import type { Calendar, CreateCalendarInput, UpdateCalendarInput } from "./types.js";

export const listCalendars = (): Promise<Calendar[]> => webCalendarClient.listCalendars();

export const createCalendar = (input: CreateCalendarInput): Promise<Calendar> =>
  webCalendarClient.createCalendar(input);

export const updateCalendar = (id: string, input: UpdateCalendarInput): Promise<Calendar> =>
  webCalendarClient.updateCalendar(id, input);

export const removeCalendar = (id: string): Promise<void> => webCalendarClient.removeCalendar(id);
