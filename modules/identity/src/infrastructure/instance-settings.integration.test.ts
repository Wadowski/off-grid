// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { readInstanceSettings } from "./read-instance-settings.js";
import { setRegistrationOpen } from "./set-registration-open.js";

describe("instance settings", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  it("starts with registration open and reads it without any user context", async () => {
    const settings = await db.db.$transaction((tx) => readInstanceSettings(tx));

    expect(settings).toEqual({ registrationOpen: true });
  });

  it("stores a change to registration", async () => {
    await db.db.$transaction((tx) => setRegistrationOpen(tx, false));

    const settings = await db.db.$transaction((tx) => readInstanceSettings(tx));

    expect(settings).toEqual({ registrationOpen: false });
  });
});
