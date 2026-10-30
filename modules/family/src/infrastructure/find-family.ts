// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Family, FamilyRow } from "../types.js";
import { toFamily } from "./to-family.js";

export const findFamily = async (client: ClientBase, familyId: string): Promise<Family | null> => {
  const { rows } = await client.query<FamilyRow>(
    "SELECT family_id, name, created_at FROM family.family WHERE family_id = $1",
    [familyId],
  );
  return rows[0] === undefined ? null : toFamily(rows[0]);
};
