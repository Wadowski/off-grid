// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";

export const applyMigrations = async (
  admin: Client,
  schema: string,
  directory: string,
): Promise<void> => {
  const names = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(`${directory}/${name}`, "utf8");
    await admin.query("BEGIN");
    try {
      await admin.query(`SET LOCAL ROLE "${schema}_owner"`);
      await admin.query(sql);
      await admin.query("COMMIT");
    } catch (error) {
      await admin.query("ROLLBACK");
      throw error;
    }
  }
};
