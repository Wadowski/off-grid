// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const revokeOwnedSession = async (
  tx: ModuleTransaction,
  userId: string,
  sessionId: string,
): Promise<boolean> => {
  const { count } = await tx.session.updateMany({
    where: { sessionId, userId, revoked: false },
    data: { revoked: true },
  });
  return count === 1;
};
