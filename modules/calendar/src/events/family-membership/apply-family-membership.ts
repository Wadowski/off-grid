// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { setPgFamilyContext } from "@offgrid/db";
import { classifySourceVersion } from "@offgrid/event-bus";
import type { SubscriberClient } from "../../types.js";

interface MembershipChange {
  readonly familyId: string;
  readonly userId: string;
  readonly sourceVersion: number;
  readonly isMember: boolean;
}

// Applies one membership change in the order the family made it. A repeated or older
// change is ignored. A missing change leaves the state unknown, so the person is
// denied until the next change for them is applied. Each statement names the
// family, so the row-level policy sees the context it needs.
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
