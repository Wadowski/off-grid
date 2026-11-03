// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const setCredentialHash = async (
  tx: ModuleTransaction,
  userId: string,
  passwordHash: string,
  now: Date,
): Promise<void> => {
  await tx.credential.update({ where: { userId }, data: { passwordHash, changedAt: now } });
};
