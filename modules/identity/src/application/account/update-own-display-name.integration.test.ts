// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { createUser } from "../registration/create-user.js";
import { updateOwnDisplayName } from "./update-own-display-name.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("updateOwnDisplayName", { timeout: 60_000 }, () => {
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

  const profileEvents = async (userId: string) => {
    const { rows } = await db.admin.query<{ source_version: number; payload: unknown }>(
      "SELECT source_version::int AS source_version, payload FROM outbox.event WHERE user_id = $1 AND type = 'user-profile-updated-v1' ORDER BY sequence",
      [userId],
    );
    return rows;
  };

  it("publishes a profile update with the next source version each time the name changes", async () => {
    const user = await createUser(db.db, {
      email: "renamed@example.com",
      displayName: "First",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });

    await updateOwnDisplayName(db.db, user.id, "Second");
    await updateOwnDisplayName(db.db, user.id, "Third");

    expect(await profileEvents(user.id)).toEqual([
      { source_version: 2, payload: { userId: user.id, displayName: "Second" } },
      { source_version: 3, payload: { userId: user.id, displayName: "Third" } },
    ]);
  });

  it("keeps the email address out of the profile update event", async () => {
    const user = await createUser(db.db, {
      email: "private-rename@example.com",
      displayName: "First",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });

    await updateOwnDisplayName(db.db, user.id, "Second");

    expect(JSON.stringify(await profileEvents(user.id))).not.toContain(
      "private-rename@example.com",
    );
  });
});
