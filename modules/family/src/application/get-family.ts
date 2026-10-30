// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FamilyPool, GetFamilyOutcome } from "../types.js";
import { withFamilyTransaction } from "../infrastructure/with-family-transaction.js";
import { setFamilyContext } from "../infrastructure/set-family-context.js";
import { findFamily } from "../infrastructure/find-family.js";
import { isMember } from "../infrastructure/is-member.js";
import { readOutcome } from "@offgrid/access-control";

export const getFamily = async (
  pool: FamilyPool,
  viewerUserId: string,
  familyId: string,
): Promise<GetFamilyOutcome> =>
  withFamilyTransaction(pool, async (client) => {
    await setFamilyContext(client, familyId);
    const family = await findFamily(client, familyId);
    const member = await isMember(client, familyId, viewerUserId);
    return readOutcome({
      value: family,
      subject: { userId: viewerUserId, groups: member ? [{ id: familyId, kind: "family" }] : [] },
      resource: { owner: { id: familyId, kind: "family" }, grants: [] },
    });
  });
