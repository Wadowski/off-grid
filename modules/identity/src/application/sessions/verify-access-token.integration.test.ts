// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { registerAccount } from "../registration/register-account.js";
import { signIn } from "./sign-in.js";
import { verifyAccessToken } from "./verify-access-token.js";

const STRONG_PASSWORD = "correct horse battery staple";

describe("verifyAccessToken", { timeout: 60_000 }, () => {
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

  it("returns the user, the session and the access expiry of a valid token", async () => {
    const { user } = await registerAccount(db.db, {
      email: "anna@example.com",
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });
    const session = await signIn(db.db, { email: "anna@example.com", password: STRONG_PASSWORD });

    const verified = await verifyAccessToken(db.db, session.accessToken);

    expect(verified).toEqual({
      userId: user.id,
      sessionId: expect.any(String),
      accessExpiresAt: session.accessExpiresAt,
    });
  });
});
