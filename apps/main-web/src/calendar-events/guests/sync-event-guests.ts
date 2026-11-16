// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { webCalendarClient } from "../../api/web-api-client.js";
import { attemptEach } from "./attempt-each.js";
import type { GuestChanges } from "../types.js";

export const syncEventGuests = async (
  eventId: string,
  changes: GuestChanges,
): Promise<GuestChanges> => {
  const toInvite = await attemptEach(changes.toInvite, (userId) =>
    webCalendarClient.inviteEventGuest(eventId, userId),
  );
  const toRemove = await attemptEach(changes.toRemove, (userId) =>
    webCalendarClient.removeEventGuest(eventId, userId),
  );
  return { toInvite, toRemove };
};
