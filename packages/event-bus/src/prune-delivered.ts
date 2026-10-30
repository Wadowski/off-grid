// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const pruneDelivered = async (
  client: ClientBase,
  retentionSeconds: number,
): Promise<number> => {
  const { rows } = await client.query<{ prune_delivered: string }>(
    "SELECT outbox.prune_delivered($1) AS prune_delivered",
    [retentionSeconds],
  );
  return Number(rows[0]?.prune_delivered);
};
