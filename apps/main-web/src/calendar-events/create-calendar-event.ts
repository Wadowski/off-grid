// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NewCalendarEventInput } from "@offgrid/contracts";
import { webCalendarClient } from "../api/web-api-client.js";

export const createCalendarEvent = (calendarId: string, request: NewCalendarEventInput) =>
  webCalendarClient.createCalendarEvent(calendarId, request);
