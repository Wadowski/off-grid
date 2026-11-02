// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { z } from "zod";
import { ACCOUNT_STATUSES, INSTANCE_ROLES } from "../constants.js";
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
    instanceRole: z.enum(INSTANCE_ROLES).parse(row.instance_role),
    status: z.enum(ACCOUNT_STATUSES).parse(row.status),
    passwordHash: row.password_hash,
  };
};
