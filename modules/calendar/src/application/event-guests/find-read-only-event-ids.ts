// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { findGuestEventIds } from "../../infrastructure/event-guests/find-guest-events.js";

// The events in the list that the guest may only read, because the guest was invited to them.
export const findReadOnlyEventIds = (
  tx: ModuleTransaction,
  input: {
    readonly guestUserId: string;
    readonly records: readonly { readonly eventId: string }[];
  },
): Promise<Set<string>> =>
  findGuestEventIds(tx, {
    guestUserId: input.guestUserId,
    eventIds: input.records.map((record) => record.eventId),
  });
