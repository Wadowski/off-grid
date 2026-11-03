// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const revokeAllSessions = async (tx: ModuleTransaction, userId: string): Promise<void> => {
  await tx.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
};
