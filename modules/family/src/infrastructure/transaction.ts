// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { appRoleOf, quoteIdent } from "@offgrid/db";
import type { Pool, PoolClient } from "pg";

export type FamilyPool = Pick<Pool, "connect">;

export async function withFamilyTransaction<T>(
  pool: FamilyPool,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`SET LOCAL ROLE ${quoteIdent(appRoleOf("family"))}`);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
