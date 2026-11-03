// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { normalizePassword } from "../../domain/password/normalize-password.js";
import { findPasswordHash } from "../../infrastructure/credentials/find-password-hash.js";
import { verifyPassword } from "../../infrastructure/credentials/verify-password.js";

export const passwordMatches = async (
  tx: ModuleTransaction,
  userId: string,
  password: string,
): Promise<boolean> => {
  const passwordHash = await findPasswordHash(tx, userId);
  return passwordHash !== null && (await verifyPassword(passwordHash, normalizePassword(password)));
};
