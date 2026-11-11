// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { insertDefaultCalendar } from "../../infrastructure/calendars/insert-default-calendar.js";
import { setUserContext } from "../../infrastructure/calendars/set-user-context.js";
import type { SubscriberClient } from "../../types.js";

export const createDefaultCalendar = async (
  client: SubscriberClient,
  userId: string,
): Promise<void> => {
  await setUserContext(client, userId);
  await insertDefaultCalendar(client, { calendarId: randomUUID(), userId });
};
