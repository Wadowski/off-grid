// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";

export const insertMembership = async (
  client: ClientBase,
  familyId: string,
  userId: string,
): Promise<void> => {
  await client.query("INSERT INTO family.family_member (family_id, user_id) VALUES ($1, $2)", [
    familyId,
    userId,
  ]);
};
