// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const revokeSession = async (tx: ModuleTransaction, sessionId: string): Promise<boolean> => {
  const { count } = await tx.session.updateMany({
    where: { sessionId, revoked: false },
    data: { revoked: true },
  });
  return count === 1;
};
