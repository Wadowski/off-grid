// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { withUserContext } from "@offgrid/db";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { createUser } from "../application/create-user.js";
import type { User } from "../types.js";
import { insertSession } from "./insert-session.js";
import { setRefreshTokenHash } from "./set-refresh-token-hash.js";
import { setSignInEmail } from "./set-sign-in-email.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("identity row isolation", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;
  let ada: User;
  let ben: User;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
    ada = await createUser(db.db, {
      email: "ada@example.com",
      displayName: "Ada",
      passwordHash: HASH,
      recoveryCodeHash: "ada-code",
    });
    ben = await createUser(db.db, {
      email: "ben@example.com",
      displayName: "Ben",
      passwordHash: HASH,
      recoveryCodeHash: "ben-code",
    });
    await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ben.id);
      await insertSession(tx, {
        id: randomUUID(),
        userId: ben.id,
        deviceLabel: "phone",
        expiresAt: new Date(Date.now() + 3_600_000),
        refreshTokenHash: "b".repeat(64),
      });
    });
  });

  it("shows a user only their own account row", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ben.id);
      return tx.userAccount.findMany({ select: { userId: true } });
    });

    expect(visible).toEqual([{ userId: ben.id }]);
  });

  it("shows no account rows when no user context is set", async () => {
    const visible = await db.db.$transaction((tx) => tx.userAccount.findMany());

    expect(visible).toEqual([]);
  });

  it("hides another user's sessions", async () => {
    const cara = await createUser(db.db, {
      email: "cara@example.com",
      displayName: "Cara",
      passwordHash: HASH,
      recoveryCodeHash: "cara-code",
    });
    const visible = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, cara.id);
      return tx.session.findMany();
    });

    expect(visible).toEqual([]);
  });

  it("hides another user's credential and recovery codes", async () => {
    const credentials = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ada.id);
      return tx.credential.findMany({ select: { userId: true } });
    });
    const codes = await db.db.$transaction(async (tx) => {
      await withUserContext(tx, ada.id);
      return tx.recoveryCode.findMany({ select: { userId: true } });
    });

    expect(credentials).toEqual([{ userId: ada.id }]);
    expect(codes).toEqual([{ userId: ada.id }]);
  });

  it("shows only the account whose email a sign-in lookup names", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await setSignInEmail(tx, "ben@example.com");
      return tx.userAccount.findMany({ select: { userId: true } });
    });

    expect(visible).toEqual([{ userId: ben.id }]);
  });

  it("shows no account to a sign-in lookup for an unknown email", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await setSignInEmail(tx, "nobody@example.com");
      return tx.userAccount.findMany({ select: { userId: true } });
    });

    expect(visible).toEqual([]);
  });

  it("shows a session only to the refresh lookup for its token digest", async () => {
    const visible = await db.db.$transaction(async (tx) => {
      await setRefreshTokenHash(tx, "b".repeat(64));
      return tx.session.findMany({ select: { userId: true } });
    });
    const unrelated = await db.db.$transaction(async (tx) => {
      await setRefreshTokenHash(tx, "c".repeat(64));
      return tx.session.findMany({ select: { userId: true } });
    });

    expect(visible).toEqual([{ userId: ben.id }]);
    expect(unrelated).toEqual([]);
  });
});
