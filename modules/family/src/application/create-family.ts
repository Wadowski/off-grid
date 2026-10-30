// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, type ModuleDatabase } from "@offgrid/db";
import { publishFamilyCreated } from "../events/publish-family-created.js";
import { insertFamily } from "../infrastructure/insert-family.js";
import { insertMembership } from "../infrastructure/insert-membership.js";
import type { Family } from "../types.js";

export const createFamily = async (
  db: ModuleDatabase,
  creatorUserId: string,
  name: string,
): Promise<Family> => {
  const id = randomUUID();
  return db.$transaction(async (tx) => {
    await withFamilyContext(tx, id);
    const family = await insertFamily(tx, { id, name });
    await insertMembership(tx, id, creatorUserId);
    await publishFamilyCreated(tx, { familyId: id, name, creatorUserId });
    return family;
  });
};
