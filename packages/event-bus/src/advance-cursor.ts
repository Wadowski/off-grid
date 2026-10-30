// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const advanceCursor = async (
  client: ClientBase,
  subscriber: string,
  sequence: number,
): Promise<void> => {
  await client.query("SELECT outbox.advance_cursor($1, $2)", [subscriber, sequence]);
};
