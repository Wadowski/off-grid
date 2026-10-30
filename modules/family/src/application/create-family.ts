// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { publishFamilyCreated } from "../events/publish-family-created.js";
import { insertFamily } from "../infrastructure/insert-family.js";
import { insertMembership } from "../infrastructure/insert-membership.js";
import { setFamilyContext } from "../infrastructure/set-family-context.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import type { Family, FamilyPool } from "../types.js";

export const createFamily = async (
  pool: FamilyPool,
  creatorUserId: string,
  name: string,
): Promise<Family> => {
  const id = randomUUID();
  return withFamilyTransaction(pool, async (client) => {
    await setFamilyContext(client, id);
    const family = await insertFamily(client, { id, name });
    await insertMembership(client, id, creatorUserId);
    await publishFamilyCreated(client, { familyId: id, name, creatorUserId });
    return family;
  });
};
