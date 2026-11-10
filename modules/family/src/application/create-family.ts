// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { withFamilyContext, type ModuleDatabase } from "@offgrid/db";
import { publishFamilyCreated } from "../events/publish-family-created.js";
import { insertFamily } from "../infrastructure/insert-family.js";
import { insertMembership } from "../infrastructure/insert-membership.js";
import type { Family, FamilyAppearance } from "../types.js";

export const DEFAULT_FAMILY_APPEARANCE: FamilyAppearance = {
  accent: "blue",
  purpose: "household",
};

export const createFamily = async (
  db: ModuleDatabase,
  creatorUserId: string,
  name: string,
  appearance: FamilyAppearance = DEFAULT_FAMILY_APPEARANCE,
): Promise<Family> => {
  const id = randomUUID();
  return db.$transaction(async (tx) => {
    await withFamilyContext(tx, id);
    const family = await insertFamily(tx, { id, name, ...appearance });
    await insertMembership(tx, id, creatorUserId, "admin");
    await publishFamilyCreated(tx, { familyId: id, name });
    return family;
  });
};
