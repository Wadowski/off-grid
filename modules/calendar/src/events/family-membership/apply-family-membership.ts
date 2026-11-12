// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { setPgFamilyContext } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import type { SubscriberClient } from "../../types.js";
import type { MembershipChange } from "../../types.js";

export const applyFamilyMembership = async (
  client: SubscriberClient,
  change: MembershipChange,
): Promise<void> => {
  await setPgFamilyContext(client, change.familyId);
  const stored = await findStoredSourceVersion(client, change);
  const outcome = classifySourceVersion(stored, change.sourceVersion);
  if (outcome === "duplicate" || outcome === "stale") {
    return;
  }
  if (outcome === "gap" && stored !== null) {
    throw new Error("membership change arrived before an earlier change");
  }
  const isMember = outcome === "apply" && change.isMember;
  await client.query(
    `INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (family_id, user_id)
     DO UPDATE SET source_version = EXCLUDED.source_version, is_member = EXCLUDED.is_member`,
    [change.familyId, change.userId, change.sourceVersion, isMember],
  );
};

const findStoredSourceVersion = async (
  client: SubscriberClient,
  change: Pick<MembershipChange, "familyId" | "userId">,
): Promise<number | null> => {
  const { rows } = await client.query<{ source_version: number }>(
    "SELECT source_version FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
    [change.familyId, change.userId],
  );
  return rows[0]?.source_version ?? null;
};
