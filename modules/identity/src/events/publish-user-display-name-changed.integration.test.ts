// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { createUser } from "../application/registration/create-user.js";
import { updateOwnDisplayName } from "../application/account/update-own-display-name.js";

const HASH = "$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA";

describe("user-display-name-changed-v1 event", { timeout: 60_000 }, () => {
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

  it("publishes the new name with the next source version after each rename", async () => {
    const user = await createUser(db.db, {
      email: "renamed@example.com",
      displayName: "Before",
      passwordHash: HASH,
      recoveryCodeHash: "recovery-hash",
    });

    await updateOwnDisplayName(db.db, user.id, "After");
    await updateOwnDisplayName(db.db, user.id, "Latest");

    const { rows } = await db.admin.query(
      `SELECT type, version, source_version, payload FROM outbox.event
        WHERE user_id = $1 AND type = 'user-display-name-changed-v1'
        ORDER BY source_version`,
      [user.id],
    );
    expect(rows).toEqual([
      {
        type: "user-display-name-changed-v1",
        version: 1,
        source_version: "2",
        payload: { userId: user.id, displayName: "After" },
      },
      {
        type: "user-display-name-changed-v1",
        version: 1,
        source_version: "3",
        payload: { userId: user.id, displayName: "Latest" },
      },
    ]);
    expect(JSON.stringify(rows)).not.toContain("renamed@example.com");
  });
});
