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

describe("list families route", { timeout: 60_000 }, () => {
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
    app = Fastify();
    await app.register(async (api) =>
      registerFamilyRoutes(api, {
        db: db.db,
        currentUserId: (request) => request.headers["x-user-id"]?.toString() ?? null,
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it("lists each family with the role the person has in it", async () => {
    const person = randomUUID();
    const owned = await createFamily(db.db, person, "Lakeside");
    const joined = await createFamily(db.db, randomUUID(), "Cabin Circle");
    await addFamilyMember(db.db, joined.id, person, "member");

    const response = await app.inject({
      method: "GET",
      url: "/families",
      headers: { "x-user-id": person },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().families).toEqual([
      { id: joined.id, name: "Cabin Circle", role: "member", accent: "blue", purpose: "household" },
      { id: owned.id, name: "Lakeside", role: "admin", accent: "blue", purpose: "household" },
    ]);
  });

  it("returns the accent and purpose a family was created with", async () => {
    const person = randomUUID();
    await createFamily(db.db, person, "Cabin Circle", { accent: "sage", purpose: "getaway" });

    const response = await app.inject({
      method: "GET",
      url: "/families",
      headers: { "x-user-id": person },
    });

    expect(response.json().families).toEqual([
      {
        id: expect.any(String),
        name: "Cabin Circle",
        role: "admin",
        accent: "sage",
        purpose: "getaway",
      },
    ]);
  });
});
