// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SubscriberClient } from "../../types.js";

export const upsertAccountName = async (
  client: SubscriberClient,
  input: { readonly userId: string; readonly displayName: string; readonly sourceVersion: number },
): Promise<void> => {
  await client.query(
    `INSERT INTO family.account_name (user_id, display_name, source_version)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE
       SET display_name = EXCLUDED.display_name,
           source_version = EXCLUDED.source_version`,
    [input.userId, input.displayName, input.sourceVersion],
  );
};
