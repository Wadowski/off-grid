// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Family, FamilyRow, NewFamily } from "../types.js";
import { requireRow } from "./require-row.js";
import { toFamily } from "./to-family.js";

export const insertFamily = async (client: ClientBase, family: NewFamily): Promise<Family> => {
  const { rows } = await client.query<FamilyRow>(
    "INSERT INTO family.family (family_id, name) VALUES ($1, $2) RETURNING family_id, name, created_at",
    [family.id, family.name],
  );
  return toFamily(requireRow(rows));
};
