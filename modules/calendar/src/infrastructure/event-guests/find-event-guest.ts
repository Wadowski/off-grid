// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findEventGuest = async (
  tx: ModuleTransaction,
  input: { readonly eventId: string; readonly guestUserId: string },
): Promise<boolean> => {
  const row = await tx.eventGuest.findUnique({
    where: { eventId_guestUserId: { eventId: input.eventId, guestUserId: input.guestUserId } },
  });
  return row !== null;
};
