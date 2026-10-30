// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Pool } from "pg";
import type { StoredEvent } from "./types.js";
import { readEventsAfter } from "./read-events-after.js";
import { withTransaction } from "./with-transaction.js";

export const readBatch = async (
  pool: Pool,
  type: string,
  after: number,
  batchSize: number,
): Promise<StoredEvent[]> =>
  withTransaction(pool, (client) => readEventsAfter(client, after, type, batchSize));
