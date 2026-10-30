// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Client } from "pg";
import { readdir, readFile } from "node:fs/promises";
import { OUTBOX_MIGRATIONS } from "./outbox-migrations.js";

export const applyOutboxMigrations = async (admin: Client): Promise<void> => {
  const names = (await readdir(OUTBOX_MIGRATIONS)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    const sql = await readFile(`${OUTBOX_MIGRATIONS}/${name}`, "utf8");
    await admin.query("BEGIN");
    try {
      await admin.query('SET LOCAL ROLE "outbox_owner"');
      await admin.query(sql);
      await admin.query("COMMIT");
    } catch (error) {
      await admin.query("ROLLBACK");
      throw error;
    }
  }
};
