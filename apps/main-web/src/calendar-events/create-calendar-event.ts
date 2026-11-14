// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewCalendarEventInput } from "@offgrid/contracts";
import { webCalendarClient } from "../api/web-api-client.js";

export const createCalendarEvent = async (
  calendarId: string,
  request: NewCalendarEventInput,
): Promise<void> => {
  await webCalendarClient.createCalendarEvent(calendarId, request);
};
