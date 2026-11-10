// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HandlerContext } from "@offgrid/event-bus";

type Client = HandlerContext["tx"];

// Applies a newer name only: a repeat or an older version leaves the row as it is.
export const upsertUserProfile = async (
  client: Client,
  userId: string,
  displayName: string,
  sourceVersion: number,
): Promise<void> => {
  await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
  await client.query(
    `INSERT INTO family.user_profile (user_id, display_name, source_version, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            source_version = EXCLUDED.source_version,
            updated_at = now()
      WHERE family.user_profile.source_version < EXCLUDED.source_version`,
    [userId, displayName, sourceVersion],
  );
};
