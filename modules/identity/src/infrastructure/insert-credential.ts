// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const insertCredential = async (
  tx: ModuleTransaction,
  userId: string,
  passwordHash: string,
): Promise<void> => {
  await tx.credential.create({ data: { userId, passwordHash } });
};
