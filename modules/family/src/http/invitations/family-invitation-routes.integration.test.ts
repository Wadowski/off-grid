// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../../test/start-family-test-database.js";
import { addFamilyMember } from "../../../test/add-family-member.js";
import { INVITATION_ATTEMPT_POLICY } from "../../constants.js";
import { createFamily } from "../../application/create-family.js";
import { createFamilyTestApp } from "../../../test/create-family-test-app.js";

describe("family invitation routes", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = await createFamilyTestApp(db);
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates an invitation for an admin and returns the code once", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    const response = await app.inject({
      method: "POST",
      url: `/families/${family.id}/invitations`,
      headers: { "x-user-id": admin },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      invitationId: expect.any(String),
      code: expect.any(String),
      expiresAt: expect.any(String),
    });
  });

  it("answers 403 when a member tries to create an invitation", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "POST",
      url: `/families/${family.id}/invitations`,
      headers: { "x-user-id": member },
    });

    expect(response.statusCode).toBe(403);
  });

  it("revokes an invitation for an admin and answers 204", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const created = await app.inject({
      method: "POST",
      url: `/families/${family.id}/invitations`,
      headers: { "x-user-id": admin },
    });

    const response = await app.inject({
      method: "DELETE",
      url: `/families/${family.id}/invitations/${created.json().invitationId}`,
      headers: { "x-user-id": admin },
    });

    expect(response.statusCode).toBe(204);
  });

  it("joins the family with a valid code and answers 201", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    const created = await app.inject({
      method: "POST",
      url: `/families/${family.id}/invitations`,
      headers: { "x-user-id": admin },
    });

    const response = await app.inject({
      method: "POST",
      url: "/families/join",
      headers: { "x-user-id": randomUUID() },
      payload: { code: created.json().code },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ familyId: family.id });
  });

  it("answers 404 with the same body for an unknown code", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families/join",
      headers: { "x-user-id": randomUUID() },
      payload: { code: "not-a-real-code" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 429 once the account has used up its wrong-code attempts", async () => {
    const joiner = randomUUID();
    for (let attempt = 0; attempt < INVITATION_ATTEMPT_POLICY.limit; attempt += 1) {
      await app.inject({
        method: "POST",
        url: "/families/join",
        headers: { "x-user-id": joiner },
        payload: { code: "not-a-real-code" },
      });
    }

    const response = await app.inject({
      method: "POST",
      url: "/families/join",
      headers: { "x-user-id": joiner },
      payload: { code: "not-a-real-code" },
    });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toMatchObject({ code: "RATE_LIMITED" });
  });

  it("answers 400 when the join request has no code", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families/join",
      headers: { "x-user-id": randomUUID() },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it("answers 401 when no user is signed in", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families/join",
      payload: { code: "not-a-real-code" },
    });

    expect(response.statusCode).toBe(401);
  });
});
