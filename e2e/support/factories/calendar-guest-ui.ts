// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext } from "@playwright/test";
import { calendarEventListSchema } from "@offgrid/contracts";
import { bearer } from "../family-sessions.js";
import type { Session } from "./instance-admin.js";

const CALENDARS = "/api/calendars";

export const findEventIdByTitle = async (
  api: APIRequestContext,
  session: Session,
  calendarId: string,
  title: string,
): Promise<string | undefined> => {
  const response = await api.get(`${CALENDARS}/${calendarId}/events`, {
    headers: bearer(session),
  });
  const events = calendarEventListSchema.parse(await response.json()).events;
  return events.find((event) => event.title === title)?.id;
};
