// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { AccountForSignIn, AccountRow } from "../types.js";

export const findAccountForSignIn = async (
  db: ModuleDatabase,
  email: string,
): Promise<AccountForSignIn | null> => {
  const rows = await db.$queryRaw<AccountRow[]>`
    SELECT user_id, email, display_name, instance_role, status, password_hash
    FROM identity.find_account_for_sign_in(${email})
  `;
  const [row] = rows;
  if (row === undefined) {
    return null;
  }
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    instanceRole: row.instance_role as AccountForSignIn["instanceRole"],
    status: row.status as AccountForSignIn["status"],
    passwordHash: row.password_hash,
  };
};
