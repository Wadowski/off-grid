// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import { uuid } from "./uuid.js";

// Sets the row-level security user for the rest of the transaction. Event
// handlers hold a pg client rather than a Prisma transaction, so they use this
// instead of withUserContext.
export const setPgUserContext = async (client: ClientBase, userId: string): Promise<void> => {
  await client.query("SELECT set_config('app.user_id', $1, true)", [uuid.parse(userId)]);
};
