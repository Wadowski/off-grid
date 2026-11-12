// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext } from "@playwright/test";
import { bearer } from "../family-sessions.js";
import type { Session } from "./instance-admin.js";

export type Calendar = {
  id: string;
  name: string;
  color: string;
  familyId: string | null;
  isDefault: boolean;
};

export type CreateCalendarInput = {
  name: string;
  color: string;
  familyId?: string;
};

export const createCalendar = async (
  api: APIRequestContext,
  session: Session,
  input: CreateCalendarInput,
): Promise<Calendar> => {
  const response = await api.post("/api/calendars", {
    headers: bearer(session),
    data: input,
    failOnStatusCode: false,
  });
  expect(response.status(), "could not create the calendar").toBe(201);
  return parseCalendar(await response.json());
};

export const listCalendars = async (
  api: APIRequestContext,
  session: Session,
): Promise<Calendar[]> => {
  const response = await api.get("/api/calendars", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), "could not list the calendars").toBe(200);
  const body: unknown = await response.json();
  if (
    typeof body === "object" &&
    body !== null &&
    "calendars" in body &&
    Array.isArray(body.calendars)
  ) {
    return body.calendars.map(parseCalendar);
  }
  throw new Error("Response is not a list of calendars.");
};

const parseCalendar = (value: unknown): Calendar => {
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
};
