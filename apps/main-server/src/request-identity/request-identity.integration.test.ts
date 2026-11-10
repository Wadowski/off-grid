// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { migrateDeploy } from "@offgrid/db";
import { familyListSchema, familySchema } from "@offgrid/contracts";
import type { LightMyRequestResponse } from "fastify";
import { z } from "zod";
import { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase } from "../../test/start-test-database.js";
import { RESET_SQL } from "../../test/constants.js";
import type { TestDatabase } from "../../test/types.js";
import { buildApp } from "../http/build-app.js";
import { resolveRequestIdentity } from "./resolve-request-identity.js";
import { createRuntime } from "../lifecycle/create-runtime.js";
import { FAMILY_HEADER } from "../constants.js";
import { modulesFor } from "../module-wiring/modules-for.js";
import type { ModuleDescriptor, ServerConfig, ServerRuntime } from "../types.js";

const PASSWORD = "correct horse battery staple";
const ANNA = { displayName: "Anna", email: "anna@example.com", password: PASSWORD };

const probeModule: ModuleDescriptor = {
  name: "probe",
  registerRoutes: (api) => {
    api.get("/probe/context", async (request) => request.requestContext);
  },
};

describe("request identity on the real stack", { timeout: 120_000 }, () => {
  let database: TestDatabase;
  let admin: Pool;
  let config: ServerConfig;
  let runtime: ServerRuntime;
  let app: FastifyInstance;

  beforeAll(async () => {
    database = await startTestDatabase();
    await migrateDeploy(database.migratorTarget);
    admin = new Pool({
      host: database.migratorTarget.host,
      port: database.migratorTarget.port,
      database: database.migratorTarget.database,
      user: database.migratorTarget.user,
      password: database.migratorTarget.password,
    });
    config = {
      http: { host: "127.0.0.1", port: 0 },
      database: database.connection,
      mail: { encryptionKey: Buffer.alloc(32, 7) },
      trustedProxies: [],
      corsOrigins: [],
      rateLimitPerMinute: 1000,
      logLevel: "error",
    };
  }, 120_000);

  afterAll(async () => {
    await admin?.end();
    await database?.stop();
  }, 120_000);

  beforeEach(async () => {
    await admin.query(RESET_SQL);
    runtime = createRuntime(config);
    app = await buildApp({
      config,
      runtime,
      modules: [...modulesFor(config), probeModule],
      identity: (request) => resolveRequestIdentity(runtime, request),
    });
    const registered = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: ANNA,
    });
    if (registered.statusCode !== 201) {
      throw new Error(`register failed: ${registered.statusCode} ${registered.body}`);
    }
  });

  afterEach(async () => {
    await app.close();
    await runtime.pool.end();
  });

  const signInToken = async (): Promise<string> => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: ANNA.email, password: PASSWORD },
    });
    if (response.statusCode !== 200) {
      throw new Error(`sign-in failed: ${response.statusCode} ${response.body}`);
    }
    return z.object({ accessToken: z.string() }).parse(response.json()).accessToken;
  };

  const bearer = (token: string, familyId?: string): Record<string, string> => ({
    authorization: `Bearer ${token}`,
    ...(familyId === undefined ? {} : { [FAMILY_HEADER]: familyId }),
  });

  const createFamily = async (
    token: string,
    name: string,
  ): Promise<z.infer<typeof familySchema>> => {
    const response = await app.inject({
      method: "POST",
      url: "/api/families",
      headers: bearer(token),
      payload: { name },
    });
    return familySchema.parse(response.json());
  };

  const insertForeignFamily = async (name: string): Promise<string> => {
    const familyId = randomUUID();
    await admin.query("INSERT INTO family.family (family_id, name) VALUES ($1, $2)", [
      familyId,
      name,
    ]);
    await admin.query("INSERT INTO family.family_member (family_id, user_id) VALUES ($1, $2)", [
      familyId,
      randomUUID(),
    ]);
    return familyId;
  };

  const probeContext = (headers: Record<string, string>): Promise<LightMyRequestResponse> =>
    app.inject({ method: "GET", url: "/api/probe/context", headers });

  it("refuses a protected request without a session", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/families",
      payload: { name: "Novak" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "UNAUTHENTICATED", message: "Sign in to continue" });
  });

  it("refuses a session token that is not valid", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/families",
      headers: bearer("not-a-real-token"),
    });

    expect(response.statusCode).toBe(401);
  });

  it("keeps the health endpoint open", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.statusCode).toBe(200);
  });

  it("answers every response with a trace id", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health" });

    expect(response.headers["x-trace-id"]).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("makes the signed-in user the first member of a family they create", async () => {
    const token = await signInToken();

    const created = await createFamily(token, "Kowalski");
    const listed = await app.inject({
      method: "GET",
      url: "/api/families",
      headers: bearer(token),
    });

    expect(familyListSchema.parse(listed.json()).families).toEqual([
      { id: created.id, name: "Kowalski" },
    ]);
  });

  it("returns a family to its member and hides it from anyone else", async () => {
    const token = await signInToken();
    const created = await createFamily(token, "Novak family");
    const foreignFamilyId = await insertForeignFamily("Someone else");

    const member = await app.inject({
      method: "GET",
      url: `/api/families/${created.id}`,
      headers: bearer(token),
    });
    const stranger = await app.inject({
      method: "GET",
      url: `/api/families/${foreignFamilyId}`,
      headers: bearer(token),
    });

    expect(member.statusCode).toBe(200);
    expect(member.json()).toEqual(created);
    expect(stranger.statusCode).toBe(404);
    expect(stranger.json().code).toBe("NOT_FOUND");
  });

  it("reports an unknown family as not found", async () => {
    const token = await signInToken();

    const response = await app.inject({
      method: "GET",
      url: `/api/families/${randomUUID()}`,
      headers: bearer(token),
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("NOT_FOUND");
  });

  it("rejects a family id in the path that is not a UUID", async () => {
    const token = await signInToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/families/not-a-uuid",
      headers: bearer(token),
    });

    expect(response.statusCode).toBe(400);
  });

  it("supplies the family context for a family the caller belongs to", async () => {
    const token = await signInToken();
    await createFamily(token, "Kowalski");
    const cabin = await createFamily(token, "Cabin Circle");

    const response = await probeContext(bearer(token, cabin.id));

    expect(response.json()).toEqual({
      userId: expect.any(String),
      sessionId: expect.any(String),
      familyId: cabin.id,
      accessGroupIds: [expect.any(String), cabin.id],
    });
  });

  it("gives user-level context only when no family is named", async () => {
    const token = await signInToken();
    await createFamily(token, "Kowalski");

    const response = await probeContext(bearer(token));

    expect(response.json()).toEqual({
      userId: expect.any(String),
      sessionId: expect.any(String),
      familyId: null,
      accessGroupIds: [expect.any(String)],
    });
  });

  it("refuses acting in a family the caller is not a member of", async () => {
    const token = await signInToken();
    const foreignFamilyId = await insertForeignFamily("Cabin Circle");

    const response = await probeContext(bearer(token, foreignFamilyId));

    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe("FORBIDDEN");
  });

  it("refuses a removed member at once, though the session is still valid", async () => {
    const token = await signInToken();
    const kowalski = await createFamily(token, "Kowalski");
    await admin.query("DELETE FROM family.family_member WHERE family_id = $1", [kowalski.id]);

    const acting = await probeContext(bearer(token, kowalski.id));
    const stillSignedIn = await app.inject({
      method: "GET",
      url: "/api/families",
      headers: bearer(token),
    });

    expect(acting.statusCode).toBe(403);
    expect(stillSignedIn.statusCode).toBe(200);
  });

  it("rejects a family header that is not an id", async () => {
    const token = await signInToken();

    const response = await probeContext(bearer(token, "not-a-uuid"));

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("INVALID_FAMILY");
  });

  it("ignores the family header when no session is sent", async () => {
    const response = await probeContext({ [FAMILY_HEADER]: randomUUID() });

    expect(response.json()).toEqual({
      userId: null,
      sessionId: null,
      familyId: null,
      accessGroupIds: [],
    });
  });

  it("rejects a family name longer than 100 characters", async () => {
    const token = await signInToken();

    const response = await app.inject({
      method: "POST",
      url: "/api/families",
      headers: bearer(token),
      payload: { name: "a".repeat(101) },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
  });

  it("rejects an empty family name with the failing field named", async () => {
    const token = await signInToken();

    const response = await app.inject({
      method: "POST",
      url: "/api/families",
      headers: bearer(token),
      payload: { name: "" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe("VALIDATION_FAILED");
    expect(response.json().message).toContain("name:");
  });

  const selectActiveFamily = (token: string, familyId: string) =>
    app.inject({
      method: "PUT",
      url: "/api/families/active",
      headers: bearer(token),
      payload: { familyId },
    });

  it("uses the family selected for the session when no family header is sent", async () => {
    const token = await signInToken();
    await createFamily(token, "Kowalski");
    const cabin = await createFamily(token, "Cabin Circle");

    const selected = await selectActiveFamily(token, cabin.id);
    const response = await probeContext(bearer(token));

    expect(selected.statusCode).toBe(200);
    expect(response.json()).toEqual({
      userId: expect.any(String),
      sessionId: expect.any(String),
      familyId: cabin.id,
      accessGroupIds: [expect.any(String), cabin.id],
    });
  });

  it("prefers the family header over the selected family", async () => {
    const token = await signInToken();
    const kowalski = await createFamily(token, "Kowalski");
    const cabin = await createFamily(token, "Cabin Circle");
    await selectActiveFamily(token, cabin.id);

    const response = await probeContext(bearer(token, kowalski.id));

    expect(response.json().familyId).toBe(kowalski.id);
  });

  it("refuses to select a family the caller does not belong to", async () => {
    const token = await signInToken();
    const foreignFamilyId = await insertForeignFamily("Cabin Circle");

    const response = await selectActiveFamily(token, foreignFamilyId);

    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe("NOT_FOUND");
  });

  it("forgets the selected family once the caller is removed from it", async () => {
    const token = await signInToken();
    await createFamily(token, "Kowalski");
    const cabin = await createFamily(token, "Cabin Circle");
    await selectActiveFamily(token, cabin.id);
    await admin.query("DELETE FROM family.family_member WHERE family_id = $1", [cabin.id]);

    const response = await probeContext(bearer(token));

    expect(response.json()).toEqual({
      userId: expect.any(String),
      sessionId: expect.any(String),
      familyId: null,
      accessGroupIds: [expect.any(String)],
    });
  });
});
