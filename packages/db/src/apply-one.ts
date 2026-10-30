// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Migration } from "./types.js";
import { quoteIdent } from "./quote-ident.js";
import { ownerRoleOf } from "./owner-role-of.js";
import { MigrationFailedError } from "./migration-failed-error.js";

export const applyOne = async (client: ClientBase, migration: Migration): Promise<void> => {
  await client.query("BEGIN");
  try {
    await client.query(`SET LOCAL ROLE ${quoteIdent(ownerRoleOf(migration.schema))}`);
    await client.query(migration.sql);
    await client.query("RESET ROLE");
    await client.query(
      "INSERT INTO public.schema_migrations (module, name, checksum) VALUES ($1, $2, $3)",
      [migration.schema, migration.name, migration.checksum],
    );
    await client.query("COMMIT");
  } catch (cause) {
    await client.query("ROLLBACK");
    throw new MigrationFailedError(migration.schema, migration.name, cause);
  }
};
