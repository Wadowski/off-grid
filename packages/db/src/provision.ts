// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { quoteIdent } from "./sql.js";

/**
 * Gives a NOLOGIN role a login and password. The roles themselves come from
 * `infra/init/sql/01-roles-and-schemas.sql`. The password is read from a secret
 * by the caller and is never logged or stored in the repository.
 */
export async function provisionLoginRole(
  admin: Client,
  role: string,
  password: string,
): Promise<void> {
  if (password.length === 0) {
    throw new Error(`refusing to provision ${role} with an empty password`);
  }
  await admin.query(
    `ALTER ROLE ${quoteIdent(role)} LOGIN PASSWORD ${admin.escapeLiteral(password)}`,
  );
}
