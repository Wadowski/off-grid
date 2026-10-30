// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { quoteIdent } from "./quote-ident.js";

export const provisionLoginRole = async (
  admin: Client,
  role: string,
  password: string,
): Promise<void> => {
  if (password.length === 0) {
    throw new Error(`refusing to provision ${role} with an empty password`);
  }
  await admin.query(
    `ALTER ROLE ${quoteIdent(role)} LOGIN PASSWORD ${admin.escapeLiteral(password)}`,
  );
};
