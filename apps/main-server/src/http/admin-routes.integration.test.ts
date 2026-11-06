// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FastifyInstance } from "fastify";
import { migrateDeploy } from "@offgrid/db";
import { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase } from "../../test/start-test-database.js";
import { RESET_SQL } from "../../test/constants.js";
import type { TestDatabase } from "../../test/types.js";
import { buildApp } from "./build-app.js";
import { createRuntime } from "../lifecycle/create-runtime.js";
import { modulesFor } from "../module-wiring/modules-for.js";
import { resolveRequestIdentity } from "../request-identity/resolve-request-identity.js";
import type { ServerConfig, ServerRuntime } from "../types.js";

const PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "a different long passphrase";
const ANNA = { displayName: "Anna", email: "anna@example.com", password: PASSWORD };
const TOM = { displayName: "Tom", email: "tom@example.com", password: PASSWORD };

describe("admin routes on the real stack", { timeout: 120_000 }, () => {
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
  });

  beforeEach(async () => {
    await admin.query(RESET_SQL);
    runtime = createRuntime(config);
    app = await buildApp({
      config,
      runtime,
      modules: modulesFor(config),
      identity: (request) => resolveRequestIdentity(runtime, request),
    });
    await register(ANNA);
  });

  afterEach(async () => {
    await app.close();
    await runtime.pool.end();
  });

  const register = async (account: typeof ANNA) => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: account,
    });
    if (response.statusCode !== 201) {
      throw new Error(`register failed: ${response.statusCode} ${response.body}`);
    }
    return response.json<{ user: { id: string } }>().user.id;
  };

  const signIn = async (account: typeof ANNA): Promise<string> => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: account.email, password: account.password },
    });
    if (response.statusCode !== 200) {
      throw new Error(`sign-in failed: ${response.statusCode} ${response.body}`);
    }
    return response.json<{ accessToken: string }>().accessToken;
  };

  const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

  it("lists every account to an admin and refuses a regular user with 403", async () => {
    const tomId = await register(TOM);
    const anna = await signIn(ANNA);
    const tom = await signIn(TOM);

    const listed = await app.inject({
      method: "GET",
      url: "/api/admin/users",
      headers: bearer(anna),
    });
    const refused = await app.inject({
      method: "GET",
      url: "/api/admin/users",
      headers: bearer(tom),
    });
    const anonymous = await app.inject({ method: "GET", url: "/api/admin/users" });

    expect(listed.statusCode).toBe(200);
    expect(listed.json<{ users: { id: string }[] }>().users.map((user) => user.id)).toContain(
      tomId,
    );
    expect(refused.statusCode).toBe(403);
    expect(anonymous.statusCode).toBe(401);
  });

  it("disables an account, ends its sessions and refuses sign-in until re-enabled", async () => {
    const tomId = await register(TOM);
    const anna = await signIn(ANNA);
    const tom = await signIn(TOM);

    const disabled = await app.inject({
      method: "POST",
      url: `/api/admin/users/${tomId}/disable`,
      headers: bearer(anna),
    });
    const staleAccess = await app.inject({
      method: "GET",
      url: "/api/families",
      headers: bearer(tom),
    });
    const refusedSignIn = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: TOM.email, password: TOM.password },
    });
    const enabled = await app.inject({
      method: "POST",
      url: `/api/admin/users/${tomId}/enable`,
      headers: bearer(anna),
    });

    expect(disabled.statusCode).toBe(200);
    expect(disabled.json<{ status: string }>().status).toBe("disabled");
    expect(staleAccess.statusCode).toBe(401);
    expect(refusedSignIn.statusCode).toBe(401);
    expect(enabled.statusCode).toBe(200);
    expect(enabled.json<{ status: string }>().status).toBe("active");
  });

  it("refuses to disable the last admin with 409", async () => {
    const annaId = (
      await app.inject({ method: "POST", url: "/api/auth/sign-in", payload: ANNA })
    ).json<{ user: { id: string } }>().user.id;
    const anna = await signIn(ANNA);

    const response = await app.inject({
      method: "POST",
      url: `/api/admin/users/${annaId}/disable`,
      headers: bearer(anna),
    });

    expect(response.statusCode).toBe(409);
    expect(response.json<{ code: string }>().code).toBe("LAST_ADMIN");
  });

  it("issues a one-time reset code that sets a new password once", async () => {
    const tomId = await register(TOM);
    const anna = await signIn(ANNA);

    const issued = await app.inject({
      method: "POST",
      url: `/api/admin/users/${tomId}/password-reset`,
      headers: bearer(anna),
    });
    const code = issued.json<{ code: string }>().code;
    const first = await app.inject({
      method: "POST",
      url: "/api/auth/password-reset",
      payload: { email: TOM.email, code, password: NEW_PASSWORD },
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/auth/password-reset",
      payload: { email: TOM.email, code, password: NEW_PASSWORD },
    });

    expect(issued.statusCode).toBe(201);
    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(400);
    expect(second.json<{ code: string }>().code).toBe("INVALID_RESET_CODE");
    const signedIn = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: TOM.email, password: NEW_PASSWORD },
    });
    expect(signedIn.statusCode).toBe(200);
  });

  it("closes registration for an admin and refuses sign-ups until it is reopened", async () => {
    const anna = await signIn(ANNA);

    const closed = await app.inject({
      method: "PATCH",
      url: "/api/admin/instance-settings",
      headers: bearer(anna),
      payload: { registrationOpen: false },
    });
    const refused = await app.inject({ method: "POST", url: "/api/auth/register", payload: TOM });

    expect(closed.statusCode).toBe(200);
    expect(refused.statusCode).toBe(403);
    expect(refused.json<{ code: string }>().code).toBe("REGISTRATION_CLOSED");
  });

  it("rejects a malformed user id before any admin check runs", async () => {
    const anna = await signIn(ANNA);

    const response = await app.inject({
      method: "POST",
      url: "/api/admin/users/not-a-uuid/disable",
      headers: bearer(anna),
    });

    expect(response.statusCode).toBe(400);
  });
});
