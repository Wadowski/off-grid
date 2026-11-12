// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarListSchema, calendarSchema } from "@offgrid/contracts";
import { webApiClient } from "../api/web-api-client.js";
import type { Calendar, CreateCalendarInput, UpdateCalendarInput } from "./types.js";

export const listCalendars = async (): Promise<Calendar[]> => {
  const body = await webApiClient.request("GET", "/calendars");
  return calendarListSchema.parse(body).calendars;
};

export const createCalendar = async (input: CreateCalendarInput): Promise<Calendar> => {
  const body = await webApiClient.request("POST", "/calendars", input);
  return calendarSchema.parse(body);
};

export const updateCalendar = async (id: string, input: UpdateCalendarInput): Promise<Calendar> => {
  const body = await webApiClient.request("PATCH", `/calendars/${encodeURIComponent(id)}`, input);
  return calendarSchema.parse(body);
};

export const removeCalendar = async (id: string): Promise<void> => {
  await webApiClient.request("DELETE", `/calendars/${encodeURIComponent(id)}`);
};
