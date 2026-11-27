// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { loadMigrations, PRISMA_MIGRATIONS_DIRECTORY } from "./index.js";

const MIGRATION_NAME = "20261205000000_calendar_family_default";
const BACKFILL_SQL = `INSERT INTO calendar.calendar (calendar_id, family_id, name, color, is_default)
SELECT gen_random_uuid(), f.family_id, 'Family', 'blue', true
FROM (SELECT DISTINCT family_id FROM calendar.family_membership WHERE is_member) f
ON CONFLICT DO NOTHING`;

const seedMembership = (db: TestDatabase, familyId: string, userId: string, isMember: boolean) =>
  db.migrator.query(
    "INSERT INTO calendar.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, $3)",
    [familyId, userId, isMember],
  );

const defaultCalendarCount = async (db: TestDatabase, familyId: string) => {
  const { rows } = await db.admin.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM calendar.calendar WHERE family_id = $1 AND is_default",
    [familyId],
  );
  return rows[0]?.n;
};

const applyMigrationsBefore = async (db: TestDatabase) => {
  await db.migrator.query(
    "CREATE TABLE IF NOT EXISTS public._prisma_migrations (migration_name varchar(255) PRIMARY KEY, checksum varchar(64) NOT NULL, finished_at timestamptz, started_at timestamptz NOT NULL DEFAULT now())",
  );
  const migrations = await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY);
  for (const migration of migrations) {
    if (migration.name === MIGRATION_NAME) {
      return;
    }
    await db.migrator.query(migration.sql);
  }
};

const applyNewMigration = async (db: TestDatabase) => {
  const [migration] = (await loadMigrations(PRISMA_MIGRATIONS_DIRECTORY)).filter(
    (candidate) => candidate.name === MIGRATION_NAME,
  );
  await db.migrator.query(migration?.sql ?? "");
};

describe("calendar family default migration", { timeout: 120_000 }, () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase({ migrate: false });
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it("gives every existing family with a member one default family calendar and nothing else", async () => {
    await applyMigrationsBefore(db);
    const familyWithOneMember = randomUUID();
    const familyWithTwoMembers = randomUUID();
    const familyWithOnlyRemovedMembers = randomUUID();
    const familyWithExistingCalendar = randomUUID();
    await seedMembership(db, familyWithOneMember, randomUUID(), true);
    await seedMembership(db, familyWithTwoMembers, randomUUID(), true);
    await seedMembership(db, familyWithTwoMembers, randomUUID(), true);
    await seedMembership(db, familyWithOnlyRemovedMembers, randomUUID(), false);
    await seedMembership(db, familyWithExistingCalendar, randomUUID(), true);
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color) VALUES ($1, $2, 'Kitchen', 'amber')",
      [randomUUID(), familyWithExistingCalendar],
    );

    await applyNewMigration(db);

    expect(await defaultCalendarCount(db, familyWithOneMember)).toBe(1);
    expect(await defaultCalendarCount(db, familyWithTwoMembers)).toBe(1);
    expect(await defaultCalendarCount(db, familyWithExistingCalendar)).toBe(1);
    expect(await defaultCalendarCount(db, familyWithOnlyRemovedMembers)).toBe(0);
  });

  it("changes nothing when the backfill runs again", async () => {
    const before = await db.admin.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM calendar.calendar",
    );

    await db.migrator.query(BACKFILL_SQL);

    const after = await db.admin.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM calendar.calendar",
    );
    expect(after.rows[0]?.n).toBe(before.rows[0]?.n);
  });

  it("refuses a second default calendar for the same family", async () => {
    const family = randomUUID();
    await db.admin.query(
      "INSERT INTO calendar.calendar (calendar_id, family_id, name, color, is_default) VALUES ($1, $2, 'Family', 'blue', true)",
      [randomUUID(), family],
    );

    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, family_id, name, color, is_default) VALUES ($1, $2, 'Other', 'green', true)",
        [randomUUID(), family],
      ),
    ).rejects.toThrow(/calendar_one_default_per_family/);
  });

  it("refuses a default calendar that has neither a family nor a user", async () => {
    await expect(
      db.admin.query(
        "INSERT INTO calendar.calendar (calendar_id, name, color, is_default) VALUES ($1, 'Orphan', 'blue', true)",
        [randomUUID()],
      ),
    ).rejects.toThrow(/calendar_default_has_owner/);
  });
});
