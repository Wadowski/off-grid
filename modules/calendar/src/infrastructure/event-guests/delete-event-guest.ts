// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const deleteEventGuest = async (
  tx: ModuleTransaction,
  input: { readonly eventId: string; readonly guestUserId: string },
): Promise<void> => {
  await tx.eventGuest.deleteMany({
    where: { eventId: input.eventId, guestUserId: input.guestUserId },
  });
};
