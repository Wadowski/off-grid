// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startFamilyTestDatabase,
  type FamilyTestDatabase,
} from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamily } from "../application/create-family.js";
import { registerFamilyRoutes } from "./register-family-routes.js";

describe("family routes keep each family's data to its members", { timeout: 60_000 }, () => {
  let db: FamilyTestDatabase;
  let app: FastifyInstance;

  let familyAId: string;
  let familyBId: string;
  const adminA = randomUUID();
  const memberA = randomUUID();
  const adminB = randomUUID();
  const personInBoth = randomUUID();

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = Fastify();
    await app.register(async (api) =>
      registerFamilyRoutes(api, {
        db: db.db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      }),
    );

    const familyA = await createFamily(db.db, adminA, "Novak family");
    const familyB = await createFamily(db.db, adminB, "Kowalski family");
    familyAId = familyA.id;
    familyBId = familyB.id;
    await addFamilyMember(db.db, familyAId, memberA, "member");
    await addFamilyMember(db.db, familyAId, personInBoth, "member");
    await addFamilyMember(db.db, familyBId, personInBoth, "member");
  });

  afterEach(async () => {
    await app.close();
  });

  const inject = (
    method: "GET" | "POST" | "PATCH" | "DELETE",
    url: string,
    userId: string,
    payload?: object,
  ) => app.inject({ method, url, headers: { "x-user-id": userId }, payload });

  it("lists to each user only the families they belong to", async () => {
    const adminAFamilies = await inject("GET", "/families", adminA);
    const personInBothFamilies = await inject("GET", "/families", personInBoth);

    expect(adminAFamilies.json().families.map((family: { id: string }) => family.id)).toEqual([
      familyAId,
    ]);
    expect(
      personInBothFamilies
        .json()
        .families.map((family: { id: string }) => family.id)
        .sort(),
    ).toEqual([familyAId, familyBId].sort());
  });

  it("answers 404 when a user asks for a family they are not in", async () => {
    const response = await inject("GET", `/families/${familyAId}`, adminB);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 when a user lists the members of a family they are not in", async () => {
    const response = await inject("GET", `/families/${familyAId}/members`, adminB);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 when an admin of one family changes the role of a member of another", async () => {
    const response = await inject("PATCH", `/families/${familyAId}/members/${memberA}`, adminB, {
      role: "admin",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 and removes nobody when an admin of one family removes a member of another", async () => {
    const response = await inject("DELETE", `/families/${familyAId}/members/${memberA}`, adminB);

    expect(response.statusCode).toBe(404);
    const membersOfA = await inject("GET", `/families/${familyAId}/members`, adminA);
    expect(membersOfA.json().members).toHaveLength(3);
  });

  it("answers 404 when an admin of one family creates an invitation for another", async () => {
    const response = await inject("POST", `/families/${familyAId}/invitations`, adminB);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers 404 when an admin of one family revokes an invitation of another", async () => {
    const created = await inject("POST", `/families/${familyAId}/invitations`, adminA);
    const invitationId = await db.admin.query<{ invitation_id: string }>(
      "SELECT invitation_id FROM family.invitation WHERE family_id = $1",
      [familyAId],
    );

    const response = await inject(
      "DELETE",
      `/families/${familyAId}/invitations/${invitationId.rows[0].invitation_id}`,
      adminB,
    );

    expect(created.statusCode).toBe(201);
    expect(response.statusCode).toBe(404);
  });

  it("answers 404 when an admin names their own family in the path but another family's member", async () => {
    const response = await inject("PATCH", `/families/${familyBId}/members/${memberA}`, adminA, {
      role: "admin",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  });

  it("lets a person in both families see each family's members separately", async () => {
    const familyA = await inject("GET", `/families/${familyAId}/members`, personInBoth);
    const familyB = await inject("GET", `/families/${familyBId}/members`, personInBoth);

    expect(familyA.statusCode).toBe(200);
    expect(familyB.statusCode).toBe(200);
    expect(
      familyA
        .json()
        .members.map((member: { userId: string }) => member.userId)
        .sort(),
    ).toEqual([adminA, memberA, personInBoth].sort());
    expect(
      familyB
        .json()
        .members.map((member: { userId: string }) => member.userId)
        .sort(),
    ).toEqual([adminB, personInBoth].sort());
  });
});
