// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { listSummariesFor } from "../infrastructure/list-summaries-for.js";
import { setUserContext } from "../infrastructure/set-user-context.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import type { FamilyPool, FamilySummary } from "../types.js";

export const listMyFamilies = async (
  pool: FamilyPool,
  viewerUserId: string,
): Promise<FamilySummary[]> =>
  withFamilyTransaction(pool, async (client) => {
    await setUserContext(client, viewerUserId);
    return listSummariesFor(client, viewerUserId);
  });
