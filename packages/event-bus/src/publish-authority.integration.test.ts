// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDatabase } from "../test/start-test-database.js";
import type { TestDatabase } from "../test/types.js";

describe("append_event publish authority", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await startTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  it("refuses a caller whose session role is not a module role", async () => {
    await expect(
      db.admin.query("SELECT outbox.append_event($1, $2, 1, 1, $3, now(), $4, NULL, $5)", [
        randomUUID(),
        "family-created-v1",
        "trace-under-test",
        randomUUID(),
        "{}",
      ]),
    ).rejects.toThrow("only a module role may publish an event");
  });
});
