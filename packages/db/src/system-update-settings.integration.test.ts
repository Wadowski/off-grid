// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";
import { assertOwnershipScopes, DATABASE_SCHEMAS } from "./index.js";

const SETTINGS_SELECT =
  "SELECT setting_key, nightly_enabled, latest_version, update_available, update_allowed, checked_at FROM system.update_settings";

describe("system update settings migration", { timeout: 120_000 }, () => {
  let db: TestDatabase;
  let app: Client;

  beforeAll(async () => {
    db = await startTestDatabase();
    app = await db.connectClient();
  }, 120_000);

  afterAll(async () => {
    await app?.end();
    await db?.stop();
  });

  it("creates the system schema owned by the migrator", async () => {
    const { rows } = await db.admin.query<{ owner: string }>(
      "SELECT pg_get_userbyid(nspowner) AS owner FROM pg_namespace WHERE nspname = 'system'",
    );

    expect(rows).toEqual([{ owner: "offgrid_migrator" }]);
  });

  it("seeds exactly one instance row with nightly updates off and no check yet", async () => {
    const { rows } = await db.admin.query(SETTINGS_SELECT);

    expect(rows).toEqual([
      {
        setting_key: "instance",
        nightly_enabled: false,
        latest_version: null,
        update_available: null,
        update_allowed: null,
        checked_at: null,
      },
    ]);
  });

  it("declares the instance scope on the table", async () => {
    const { rows } = await db.admin.query<{ comment: string }>(
      "SELECT obj_description('system.update_settings'::regclass, 'pg_class') AS comment",
    );

    expect(rows).toEqual([{ comment: "offgrid:scope=instance" }]);
    await expect(assertOwnershipScopes(db.migrator, DATABASE_SCHEMAS)).resolves.toBeUndefined();
  });

  it("lets offgrid_app read and update the instance row", async () => {
    await app.query(
      "UPDATE system.update_settings SET nightly_enabled = true WHERE setting_key = 'instance'",
    );
    const { rows } = await app.query<{ nightly_enabled: boolean }>(
      "SELECT nightly_enabled FROM system.update_settings WHERE setting_key = 'instance'",
    );

    expect(rows).toEqual([{ nightly_enabled: true }]);
    await app.query(
      "UPDATE system.update_settings SET nightly_enabled = false WHERE setting_key = 'instance'",
    );
  });

  it("refuses a second row for the instance", async () => {
    await expect(
      app.query("INSERT INTO system.update_settings (setting_key) VALUES ('other')"),
    ).rejects.toThrow(/check constraint|violates/);
    await expect(
      app.query("INSERT INTO system.update_settings (setting_key) VALUES ('instance')"),
    ).rejects.toThrow(/duplicate key/);
  });
});
