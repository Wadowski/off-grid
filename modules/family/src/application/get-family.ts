// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readOutcome, type ReadOutcome } from "@offgrid/access-control";
import { withFamilyContext, withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findFamily } from "../infrastructure/find-family.js";
import { isMember } from "../infrastructure/is-member.js";
import type { Family } from "../types.js";

export const getFamily = async (
  db: ModuleDatabase,
  viewerUserId: string,
  familyId: string,
): Promise<ReadOutcome<Family>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, viewerUserId);
    if (!(await isMember(tx, familyId, viewerUserId))) {
      return { outcome: "not-found" };
    }
    await withFamilyContext(tx, familyId);
    const family = await findFamily(tx, familyId);
    return readOutcome({
      value: family,
      subject: { userId: viewerUserId, groups: [{ id: familyId, kind: "family" }] },
      resource: { owner: { id: familyId, kind: "family" }, grants: [] },
    });
  });
