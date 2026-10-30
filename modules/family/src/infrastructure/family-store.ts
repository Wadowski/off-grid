// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ClientBase } from "pg";
import type { Family } from "../domain/family.js";

export interface FamilySummaryRow {
  readonly id: string;
  readonly name: string;
}

interface FamilyRow {
  readonly family_id: string;
  readonly name: string;
  readonly created_at: Date;
}

export async function setFamilyContext(client: ClientBase, familyId: string): Promise<void> {
  await client.query("SELECT set_config('app.family_id', $1, true)", [familyId]);
}

export async function setUserContext(client: ClientBase, userId: string): Promise<void> {
  await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
}

export async function insertFamily(
  client: ClientBase,
  family: { readonly id: string; readonly name: string },
): Promise<Family> {
  const { rows } = await client.query<FamilyRow>(
    "INSERT INTO family.family (family_id, name) VALUES ($1, $2) RETURNING family_id, name, created_at",
    [family.id, family.name],
  );
  return toFamily(requireRow(rows));
}

export async function insertMembership(
  client: ClientBase,
  familyId: string,
  userId: string,
): Promise<void> {
  await client.query("INSERT INTO family.family_member (family_id, user_id) VALUES ($1, $2)", [
    familyId,
    userId,
  ]);
}

export async function findFamily(client: ClientBase, familyId: string): Promise<Family | null> {
  const { rows } = await client.query<FamilyRow>(
    "SELECT family_id, name, created_at FROM family.family WHERE family_id = $1",
    [familyId],
  );
  return rows[0] === undefined ? null : toFamily(rows[0]);
}

export async function isMember(
  client: ClientBase,
  familyId: string,
  userId: string,
): Promise<boolean> {
  const { rows } = await client.query<{ present: boolean }>(
    "SELECT true AS present FROM family.family_member WHERE family_id = $1 AND user_id = $2",
    [familyId, userId],
  );
  return rows.length > 0;
}

export async function listSummariesFor(
  client: ClientBase,
  userId: string,
): Promise<FamilySummaryRow[]> {
  const { rows } = await client.query<{ family_id: string; name: string }>(
    "SELECT family_id, name FROM family.family_summary WHERE user_id = $1 ORDER BY name, family_id",
    [userId],
  );
  return rows.map((row) => ({ id: row.family_id, name: row.name }));
}

export async function readSummaryVersion(
  client: ClientBase,
  userId: string,
  familyId: string,
): Promise<number | null> {
  const { rows } = await client.query<{ source_version: string }>(
    "SELECT source_version FROM family.family_summary WHERE user_id = $1 AND family_id = $2",
    [userId, familyId],
  );
  return rows[0] === undefined ? null : Number(rows[0].source_version);
}

export async function upsertSummary(
  client: ClientBase,
  summary: {
    readonly userId: string;
    readonly familyId: string;
    readonly name: string;
    readonly sourceVersion: number;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO family.family_summary (user_id, family_id, name, source_version)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, family_id) DO UPDATE
       SET name = EXCLUDED.name, source_version = EXCLUDED.source_version`,
    [summary.userId, summary.familyId, summary.name, summary.sourceVersion],
  );
}

function toFamily(row: FamilyRow): Family {
  return {
    id: row.family_id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
  };
}

function requireRow<Row>(rows: readonly Row[]): Row {
  const [row] = rows;
  if (row === undefined) {
    throw new Error("insert returned no row");
  }
  return row;
}
