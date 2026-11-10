// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { findActiveFamilyForSession } from "./find-active-family-for-session.js";

describe("findActiveFamilyForSession", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  it("returns null when the session has made no choice", async () => {
    expect(await findActiveFamilyForSession(db.db, randomUUID(), randomUUID())).toBeNull();
  });
});
