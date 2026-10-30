// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const recordDeadLetter = async (
  client: ClientBase,
  subscriber: string,
  sequence: number,
  attempts: number,
  errorName: string,
): Promise<void> => {
  await client.query("SELECT outbox.record_dead_letter($1, $2, $3, $4)", [
    subscriber,
    sequence,
    attempts,
    errorName,
  ]);
};
