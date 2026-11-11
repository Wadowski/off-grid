// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { setPgUserContext } from "@offgrid/db";
import { insertDefaultCalendar } from "../../infrastructure/calendars/insert-default-calendar.js";
import type { SubscriberClient } from "../../types.js";

export const createDefaultCalendar = async (
  client: SubscriberClient,
  userId: string,
): Promise<void> => {
  await setPgUserContext(client, userId);
  await insertDefaultCalendar(client, { calendarId: randomUUID(), userId });
};
