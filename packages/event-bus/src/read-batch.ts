// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReplayOptions, StoredEvent } from "./types.js";
import { readEventsAfter } from "./read-events-after.js";

export const readBatch = async (
  options: Pick<ReplayOptions, "pool">,
  type: string,
  after: number,
  batchSize: number,
): Promise<StoredEvent[]> => {
  const client = await options.pool.connect();
  try {
    await client.query("BEGIN");
    const stored = await readEventsAfter(client, after, type, batchSize);
    await client.query("COMMIT");
    return stored;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
};
