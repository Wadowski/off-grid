// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamily } from "../application/create-family.js";
import { createFamilyTestApp } from "../../test/create-family-test-app.js";

describe("family member routes", { timeout: 60_000 }, () => {
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

  it("lists the members to a member of the family", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "GET",
      url: `/families/${family.id}/members`,
      headers: { "x-user-id": member },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().members).toHaveLength(2);
  });

  it("answers 401 when no user is signed in", async () => {
    const family = await createFamily(db.db, randomUUID(), "Novak family");

    const response = await app.inject({ method: "GET", url: `/families/${family.id}/members` });

    expect(response.statusCode).toBe(401);
  });

  it("changes a role for an admin", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "PATCH",
      url: `/families/${family.id}/members/${member}`,
      headers: { "x-user-id": admin },
      payload: { role: "admin" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ userId: member, role: "admin" });
  });

  it("answers 403 with ACCESS_DENIED when a member changes a role", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "PATCH",
      url: `/families/${family.id}/members/${admin}`,
      headers: { "x-user-id": member },
      payload: { role: "member" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("ACCESS_DENIED");
  });

  it("answers 400 for a role that does not exist", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    const response = await app.inject({
      method: "PATCH",
      url: `/families/${family.id}/members/${admin}`,
      headers: { "x-user-id": admin },
      payload: { role: "owner" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
  });

  it("answers 409 with LAST_ADMIN when the last admin is demoted", async () => {
    const admin = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");

    const response = await app.inject({
      method: "PATCH",
      url: `/families/${family.id}/members/${admin}`,
      headers: { "x-user-id": admin },
      payload: { role: "member" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().code).toBe("LAST_ADMIN");
  });

  it("answers 204 when an admin removes a member", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "DELETE",
      url: `/families/${family.id}/members/${member}`,
      headers: { "x-user-id": admin },
    });

    expect(response.statusCode).toBe(204);
  });

  it("answers 403 when a member removes another member", async () => {
    const admin = randomUUID();
    const member = randomUUID();
    const family = await createFamily(db.db, admin, "Novak family");
    await addFamilyMember(db.db, family.id, member, "member");

    const response = await app.inject({
      method: "DELETE",
      url: `/families/${family.id}/members/${admin}`,
      headers: { "x-user-id": member },
    });

    expect(response.statusCode).toBe(403);
  });
});
