// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase } from "../../test/start-family-test-database.js";
import { addFamilyMember } from "../../test/add-family-member.js";
import { createFamilyTestApp } from "../../test/create-family-test-app.js";
import type { FamilyTestDatabase } from "../../test/types.js";
import { createFamily } from "../application/create-family.js";

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
    app = await createFamilyTestApp(db);

    familyAId = (await createFamily(db.db, adminA, "Family A")).id;
    familyBId = (await createFamily(db.db, adminB, "Family B")).id;
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

  const expectNotFound = (response: { statusCode: number; json(): unknown }) => {
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
  };

  const sortedIdsOf = (items: { id: string }[]) => items.map((item) => item.id).sort();

  const sortedUserIdsOf = (members: { userId: string }[]) =>
    members.map((member) => member.userId).sort();

  const memberCountOfA = async () =>
    (await inject("GET", `/families/${familyAId}/members`, adminA)).json().members.length;

  it("lists to each user only the families they belong to", async () => {
    const adminAFamilies = await inject("GET", "/families", adminA);
    const personInBothFamilies = await inject("GET", "/families", personInBoth);

    expect(sortedIdsOf(adminAFamilies.json().families)).toEqual([familyAId]);
    expect(sortedIdsOf(personInBothFamilies.json().families)).toEqual(
      [familyAId, familyBId].sort(),
    );
  });

  it("answers 404 when a user asks for a family they are not in", async () => {
    expectNotFound(await inject("GET", `/families/${familyAId}`, adminB));
  });

  it("answers 404 when a user lists the members of a family they are not in", async () => {
    expectNotFound(await inject("GET", `/families/${familyAId}/members`, adminB));
  });

  it("answers 404 when an admin of one family changes the role of a member of another", async () => {
    const response = await inject("PATCH", `/families/${familyAId}/members/${memberA}`, adminB, {
      role: "admin",
    });

    expectNotFound(response);
    const membersOfA = await inject("GET", `/families/${familyAId}/members`, adminA);
    expect(membersOfA.json().members).toEqual(
      expect.arrayContaining([expect.objectContaining({ userId: memberA, role: "member" })]),
    );
  });

  it("answers 404 and removes nobody when an admin of one family removes a member of another", async () => {
    const membersBefore = await memberCountOfA();

    expectNotFound(await inject("DELETE", `/families/${familyAId}/members/${memberA}`, adminB));

    expect(await memberCountOfA()).toBe(membersBefore);
  });

  it("answers 404 and creates no invitation when an admin of one family invites into another", async () => {
    expectNotFound(await inject("POST", `/families/${familyAId}/invitations`, adminB));

    const invitations = await db.admin.query(
      "SELECT 1 FROM family.invitation WHERE family_id = $1",
      [familyAId],
    );
    expect(invitations.rows).toEqual([]);
  });

  it("answers 404 and leaves the invitation open when an admin of one family revokes another's invitation", async () => {
    const created = await inject("POST", `/families/${familyAId}/invitations`, adminA);
    expect(created.statusCode).toBe(201);
    const invitationId = created.json().invitationId;

    expectNotFound(
      await inject("DELETE", `/families/${familyAId}/invitations/${invitationId}`, adminB),
    );

    const invitation = await db.admin.query(
      "SELECT revoked_at FROM family.invitation WHERE invitation_id = $1",
      [invitationId],
    );
    expect(invitation.rows).toEqual([{ revoked_at: null }]);
  });

  it("answers 404 when an admin names a family they are not in, in the path", async () => {
    expectNotFound(
      await inject("PATCH", `/families/${familyBId}/members/${memberA}`, adminA, {
        role: "admin",
      }),
    );
  });

  it("lets a person in both families see each family's members separately", async () => {
    const membersOfA = await inject("GET", `/families/${familyAId}/members`, personInBoth);
    const membersOfB = await inject("GET", `/families/${familyBId}/members`, personInBoth);

    expect(membersOfA.statusCode).toBe(200);
    expect(membersOfB.statusCode).toBe(200);
    expect(sortedUserIdsOf(membersOfA.json().members)).toEqual(
      [adminA, memberA, personInBoth].sort(),
    );
    expect(sortedUserIdsOf(membersOfB.json().members)).toEqual([adminB, personInBoth].sort());
  });
});
