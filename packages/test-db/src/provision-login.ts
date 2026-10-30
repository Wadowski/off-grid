// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { appRoleOf, type DatabaseSchema } from "@offgrid/db";

export const provisionLogin = async (
  admin: Client,
  schema: DatabaseSchema,
  password: string,
): Promise<void> => {
  await admin.query(
    `ALTER ROLE "${appRoleOf(schema)}" LOGIN PASSWORD ${admin.escapeLiteral(password)}`,
  );
};
