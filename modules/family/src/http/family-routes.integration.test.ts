// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { familySchema } from "@offgrid/contracts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFamilyTestDatabase } from "../../test/start-family-test-database.js";
import type { FamilyTestDatabase } from "../../test/types.js";
import { familyModule } from "../index.js";

const USER_HEADER = "x-test-user-id";

describe("family HTTP routes", () => {
  let db: FamilyTestDatabase;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = await startFamilyTestDatabase();
    const context = {
      db: db.db,
      currentUserId: (request: FastifyRequest) => {
        const header = request.headers[USER_HEADER];
        return typeof header === "string" ? header : null;
      },
    };
    app = Fastify();
    familyModule.registerRoutes(app, context);
    await app.ready();
  }, 120_000);

  afterAll(async () => {
    await app.close();
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
  });

  const createFamily = async (userId: string, name: string) => {
    const response = await app.inject({
      method: "POST",
      url: "/families",
      headers: { [USER_HEADER]: userId },
      payload: { name },
    });
    return familySchema.parse(response.json());
  };

  it("refuses to create a family without a signed-in user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families",
      payload: { name: "Novak" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "UNAUTHENTICATED", message: "Sign in to continue" });
  });

  it("rejects an empty family name with the failing field named", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families",
      headers: { [USER_HEADER]: randomUUID() },
      payload: { name: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
    expect(response.json().message).toContain("name:");
  });

  it("rejects a name longer than 100 characters", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families",
      headers: { [USER_HEADER]: randomUUID() },
      payload: { name: "a".repeat(101) },
    });

    expect(response.statusCode).toBe(400);
  });

  it("creates a family and returns it", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/families",
      headers: { [USER_HEADER]: randomUUID() },
      payload: { name: "Novak family" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: expect.any(String),
      name: "Novak family",
      createdAt: expect.any(String),
    });
  });

  it("returns a family to its member", async () => {
    const creator = randomUUID();
    const created = await createFamily(creator, "Novak family");

    const response = await app.inject({
      method: "GET",
      url: `/families/${created.id}`,
      headers: { [USER_HEADER]: creator },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(created);
  });

  it("hides a family from a user who is not a member", async () => {
    const created = await createFamily(randomUUID(), "Novak family");

    const response = await app.inject({
      method: "GET",
      url: `/families/${created.id}`,
      headers: { [USER_HEADER]: randomUUID() },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("NOT_FOUND");
  });

  it("reports an unknown family as not found", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/families/${randomUUID()}`,
      headers: { [USER_HEADER]: randomUUID() },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("NOT_FOUND");
  });

  it("rejects a family id that is not a UUID", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/families/not-a-uuid",
      headers: { [USER_HEADER]: randomUUID() },
    });

    expect(response.statusCode).toBe(400);
  });

  it("lists only the caller's families", async () => {
    const creator = randomUUID();
    const created = await createFamily(creator, "Novak family");
    await createFamily(randomUUID(), "Someone else");

    const response = await app.inject({
      method: "GET",
      url: "/families",
      headers: { [USER_HEADER]: creator },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ families: [{ id: created.id, name: "Novak family" }] });
  });
});
