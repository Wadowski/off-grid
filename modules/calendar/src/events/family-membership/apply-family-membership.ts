// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { setPgFamilyContext } from "@offgrid/db";
import type { SubscriberClient } from "../../types.js";

// Each statement names the family, so the row-level policy sees the context it needs.
export const addFamilyMembership = async (
  client: SubscriberClient,
  change: { readonly familyId: string; readonly userId: string },
): Promise<void> => {
  await setPgFamilyContext(client, change.familyId);
  await client.query(
    `INSERT INTO calendar.family_membership (family_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (family_id, user_id) DO NOTHING`,
    [change.familyId, change.userId],
  );
};

export const removeFamilyMembership = async (
  client: SubscriberClient,
  change: { readonly familyId: string; readonly userId: string },
): Promise<void> => {
  await setPgFamilyContext(client, change.familyId);
  await client.query(
    "DELETE FROM calendar.family_membership WHERE family_id = $1 AND user_id = $2",
    [change.familyId, change.userId],
  );
};
