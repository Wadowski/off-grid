// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createModuleDb, migrateDeploy, type ModuleDatabase } from "@offgrid/db";
import { createLogger, type ErrorRecord, type Logger } from "@offgrid/observability";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { startTestDatabase } from "../../test/start-test-database.js";
import type { TestDatabase } from "../../test/types.js";
import { ERROR_RECORD_RETENTION_MS } from "../constants.js";
import { persistErrorRecord } from "./persist-error-record.js";
import { pruneErrorRecords } from "./prune-error-records.js";

const NOW = new Date("2026-11-06T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

interface StoredRow {
  readonly name: string;
  readonly code: string | null;
  readonly context: unknown;
}

const recordAt = (recordedAt: Date, overrides: Partial<ErrorRecord> = {}): ErrorRecord => ({
  recorded_at: recordedAt.toISOString(),
  name: "TypeError",
  code: "E_TEST",
  trace_id: "0af7651916cd43dd8448eb211c80319c",
  context: { route: "/api/me", password: "[REDACTED]" },
  ...overrides,
});

describe("error records", { timeout: 60_000 }, () => {
  let database: TestDatabase;
  let runtimePool: Pool;
  let ownerPool: Pool;
  let db: ModuleDatabase;
  let logger: Logger;

  beforeAll(async () => {
    database = await startTestDatabase();
    await migrateDeploy(database.migratorTarget);
    runtimePool = new Pool({
      host: database.connection.host,
      port: database.connection.port,
      database: database.connection.name,
      user: database.connection.user,
      password: database.connection.password,
      max: 2,
    });
    ownerPool = new Pool({
      host: database.migratorTarget.host,
      port: database.migratorTarget.port,
      database: database.migratorTarget.database,
      user: database.migratorTarget.user,
      password: database.migratorTarget.password,
      max: 1,
    });
    db = createModuleDb(runtimePool);
    logger = createLogger({ level: "error", bindings: { module: "test" } });
  }, 120_000);

  afterAll(async () => {
    await db.$disconnect();
    await runtimePool.end();
    await ownerPool.end();
    await database.stop();
  });

  beforeEach(async () => {
    await ownerPool.query("TRUNCATE observability.error_record");
  });

  const storedRows = async (): Promise<StoredRow[]> => {
    const { rows } = await ownerPool.query<StoredRow>(
      "SELECT name, code, context FROM observability.error_record ORDER BY name",
    );
    return rows;
  };

  describe("persistErrorRecord", () => {
    it("stores the record with its redacted context", async () => {
      await persistErrorRecord(db, logger, recordAt(NOW));

      expect(await storedRows()).toEqual([
        {
          name: "TypeError",
          code: "E_TEST",
          context: { route: "/api/me", password: "[REDACTED]" },
        },
      ]);
    });

    it("logs and does not throw when the write fails", async () => {
      const unreachable = createModuleDb(
        new Pool({
          host: "127.0.0.1",
          port: 1,
          database: "none",
          user: "none",
          connectionTimeoutMillis: 200,
        }),
      );
      const warn = vi.spyOn(logger, "warn");

      await expect(persistErrorRecord(unreachable, logger, recordAt(NOW))).resolves.toBeUndefined();

      expect(warn).toHaveBeenCalledWith(
        "error record not stored",
        expect.objectContaining({ action: "error-record.not-stored" }),
      );
      expect(await storedRows()).toEqual([]);
      await unreachable.$disconnect();
    });
  });

  describe("pruneErrorRecords", () => {
    it("deletes records older than the retention period and keeps recent ones", async () => {
      const old = new Date(NOW.getTime() - ERROR_RECORD_RETENTION_MS - DAY_MS);
      const recent = new Date(NOW.getTime() - DAY_MS);
      await persistErrorRecord(db, logger, recordAt(old, { name: "OldError" }));
      await persistErrorRecord(db, logger, recordAt(recent, { name: "RecentError" }));

      const deleted = await pruneErrorRecords(db, NOW);

      expect(deleted).toBe(1);
      expect((await storedRows()).map((row) => row.name)).toEqual(["RecentError"]);
    });
  });
});
