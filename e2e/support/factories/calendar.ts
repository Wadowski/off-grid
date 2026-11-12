// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ApiClient } from "../api.js";

export type Calendar = {
  id: string;
  name: string;
  color: string;
  familyId: string | null;
  isDefault: boolean;
};

export type CreateCalendarInput = {
  name?: string;
  color?: string;
  familyId?: string;
};

function uniqueName(prefix: string): string {
  return `${prefix} ${randomUUID().slice(0, 8)}`;
}

export async function createCalendar(
  api: ApiClient,
  { name = uniqueName("Calendar"), color = "blue", familyId }: CreateCalendarInput = {},
): Promise<Calendar> {
  const body = familyId === undefined ? { name, color } : { name, color, familyId };
  return parseCalendar(await api.request("POST", "/calendars", body));
}

export async function listCalendars(api: ApiClient): Promise<Calendar[]> {
  const body: unknown = await api.request("GET", "/calendars");
  if (
    typeof body === "object" &&
    body !== null &&
    "calendars" in body &&
    Array.isArray(body.calendars)
  ) {
    return body.calendars.map(parseCalendar);
  }
  throw new Error("Response is not a list of calendars.");
}

function parseCalendar(value: unknown): Calendar {
  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "color" in value &&
    typeof value.color === "string" &&
    "familyId" in value &&
    (typeof value.familyId === "string" || value.familyId === null) &&
    "isDefault" in value &&
    typeof value.isDefault === "boolean"
  ) {
    return {
      id: value.id,
      name: value.name,
      color: value.color,
      familyId: value.familyId,
      isDefault: value.isDefault,
    };
  }
  throw new Error("Response is not a calendar with the expected fields.");
}
