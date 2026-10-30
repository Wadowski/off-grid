// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Pool, PoolClient } from "pg";

export const withTransaction = async <T>(
  pool: Pool,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  let releaseError: Error | undefined;
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch((rollbackError: unknown) => {
      releaseError =
        rollbackError instanceof Error ? rollbackError : new Error(String(rollbackError));
    });
    throw error;
  } finally {
    client.release(releaseError);
  }
};
