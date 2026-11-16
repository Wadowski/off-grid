// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findEventGuests = (tx: ModuleTransaction, eventId: string) =>
  tx.eventGuest.findMany({
    where: { eventId },
    select: { guestUserId: true, invitedAt: true },
    orderBy: { invitedAt: "asc" },
  });
