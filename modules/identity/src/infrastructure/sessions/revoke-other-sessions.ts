// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const revokeOtherSessions = async (
  tx: ModuleTransaction,
  userId: string,
  currentSessionId: string,
): Promise<void> => {
  await tx.session.updateMany({
    where: { userId, revoked: false, NOT: { sessionId: currentSessionId } },
    data: { revoked: true },
  });
};
