// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SubscriberClient } from "../../types.js";

// Sets the row-level security user for the rest of the transaction, so the
// account-name upsert and read see the account they are about to change.
export const setUserContext = async (client: SubscriberClient, userId: string): Promise<void> => {
  await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
};
