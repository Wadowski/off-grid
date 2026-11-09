// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadOutcome } from "@offgrid/access-control";
import { withFamilyContext, withUserContext, type ModuleDatabase } from "@offgrid/db";
import { findMembership } from "../infrastructure/find-membership.js";
import { listMembers } from "../infrastructure/list-members.js";
import type { FamilyMemberList } from "../types.js";

export const listFamilyMembers = async (
  db: ModuleDatabase,
  viewerUserId: string,
  familyId: string,
): Promise<ReadOutcome<FamilyMemberList>> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, viewerUserId);
    if ((await findMembership(tx, familyId, viewerUserId)) === null) {
      return { outcome: "not-found" };
    }
    await withFamilyContext(tx, familyId);
    return { outcome: "found", value: { members: await listMembers(tx, familyId) } };
  });
