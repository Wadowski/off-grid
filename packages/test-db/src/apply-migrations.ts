// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Client } from "pg";
import { ownerRoleOf, quoteIdent, type DatabaseSchema } from "@offgrid/db";

export const applyMigrations = async (
  admin: Client,
  schema: DatabaseSchema,
  directory: string,
): Promise<void> => {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(join(directory, name), "utf8");
    await admin.query("BEGIN");
    try {
      await admin.query(`SET LOCAL ROLE ${quoteIdent(ownerRoleOf(schema))}`);
      await admin.query(sql);
      await admin.query("COMMIT");
    } catch (error) {
      await admin.query("ROLLBACK");
      throw error;
    }
  }
};
