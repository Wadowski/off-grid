// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { migrateDeploy } from "./index.js";

const DEPLOY_TIMEOUT_MS = 60_000;

describe("calendar_event_range_idx migration", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase({ migrate: false });
  }, 120_000);

  afterAll(async () => {
    await db?.stop();
  });

  it(
    "creates the time-range index on calendar_event after migrateDeploy",
    async () => {
      await migrateDeploy(db.migratorTarget);

      const indexes = await db.admin.query<{ indexdef: string }>(
        "SELECT indexdef FROM pg_indexes WHERE schemaname = 'calendar' AND tablename = 'calendar_event' AND indexname = 'calendar_event_range_idx'",
      );
      expect(indexes.rowCount).toBe(1);
      expect(indexes.rows[0]?.indexdef).toContain("(starts_at, ends_at)");
    },
    DEPLOY_TIMEOUT_MS,
  );
});
