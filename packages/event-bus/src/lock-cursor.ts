// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const lockCursor = async (
  client: ClientBase,
  subscriber: string,
): Promise<number | null> => {
  const { rows } = await client.query<{ position: string | null }>(
    "SELECT outbox.lock_cursor($1) AS position",
    [subscriber],
  );
  const position = rows[0]?.position;
  return position === null || position === undefined ? null : Number(position);
};
