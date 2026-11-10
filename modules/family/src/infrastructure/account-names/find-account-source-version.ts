// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SubscriberClient } from "../../types.js";

export const findAccountSourceVersion = async (
  client: SubscriberClient,
  userId: string,
): Promise<number | null> => {
  const { rows } = await client.query<{ source_version: number }>(
    "SELECT source_version FROM family.account_name WHERE user_id = $1",
    [userId],
  );
  return rows[0]?.source_version ?? null;
};
