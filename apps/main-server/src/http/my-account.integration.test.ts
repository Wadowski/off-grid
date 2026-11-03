// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { migrateDeploy } from "@offgrid/db";
import {
  accountProfileSchema,
  familySchema,
  recoveryCodeIssuedSchema,
  sessionListSchema,
} from "@offgrid/contracts";
import type { LightMyRequestResponse } from "fastify";
import { z } from "zod";
import { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startTestDatabase } from "../../test/start-test-database.js";
import { RESET_SQL } from "../../test/constants.js";
import type { TestDatabase } from "../../test/types.js";
import { buildApp } from "./build-app.js";
import { resolveRequestIdentity } from "../request-identity/resolve-request-identity.js";
import { createRuntime } from "../lifecycle/create-runtime.js";
import { MODULES } from "../constants.js";
import type { ServerConfig, ServerRuntime } from "../types.js";

const PASSWORD = "correct horse battery staple";
const NEW_PASSWORD = "steady river lantern orbit";
const ANNA = { displayName: "Anna", email: "anna@example.com", password: PASSWORD };
const BEN = {
  displayName: "Ben",
  email: "ben@example.com",
  password: "quiet mountain harbor bridge",
};
const tokenSchema = z.object({ accessToken: z.string() });

const sha256Hex = (value: string): string => createHash("sha256").update(value).digest("hex");

describe("my account on the real stack", { timeout: 120_000 }, () => {
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
      modules: MODULES,
      identity: (request) => resolveRequestIdentity(runtime, request),
    });
    await app.inject({ method: "POST", url: "/api/auth/register", payload: ANNA });
  });

  afterEach(async () => {
    await app.close();
    await runtime.pool.end();
  });

  const signIn = async (
    account: { email: string; password: string },
    deviceLabel?: string,
  ): Promise<string> => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { ...account, deviceLabel },
    });
    if (response.statusCode !== 200) {
      throw new Error(`sign-in failed: ${response.statusCode} ${response.body}`);
    }
    return tokenSchema.parse(response.json()).accessToken;
  };

  const bearer = (token: string): Record<string, string> => ({ authorization: `Bearer ${token}` });

  const requestAs = (
    token: string,
    method: "GET" | "PATCH" | "POST" | "DELETE",
    url: string,
    payload?: Record<string, unknown>,
  ): Promise<LightMyRequestResponse> =>
    app.inject({ method, url, headers: bearer(token), payload });

  const currentSessionOf = async (token: string) => {
    const sessions = sessionListSchema.parse(
      (await requestAs(token, "GET", "/api/me/sessions")).json(),
    ).sessions;
    const current = sessions.find((session) => session.current);
    if (current === undefined) {
      throw new Error("no current session listed");
    }
    return current;
  };

  it("shows my profile with every family I belong to", async () => {
    const token = await signIn(ANNA);
    await requestAs(token, "POST", "/api/families", { name: "Kowalski" });
    await requestAs(token, "POST", "/api/families", { name: "Cabin Circle" });

    const response = await requestAs(token, "GET", "/api/me");

    expect(response.statusCode).toBe(200);
    const profile = accountProfileSchema.parse(response.json());
    expect(profile).toMatchObject({
      email: ANNA.email,
      displayName: "Anna",
      instanceRole: "admin",
    });
    expect(profile.families.map((family) => family.name).sort()).toEqual([
      "Cabin Circle",
      "Kowalski",
    ]);
    expect(
      familySchema.safeParse({ ...profile.families[0], createdAt: new Date().toISOString() })
        .success,
    ).toBe(true);
  });

  it("refuses my account and sessions without a session", async () => {
    const responses = await Promise.all([
      app.inject({ method: "GET", url: "/api/me" }),
      app.inject({ method: "GET", url: "/api/me/sessions" }),
      app.inject({ method: "PATCH", url: "/api/me", payload: { displayName: "Nobody" } }),
    ]);

    expect(responses.map((response) => response.statusCode)).toEqual([401, 401, 401]);
  });

  it("updates my display name", async () => {
    const token = await signIn(ANNA);

    const update = await requestAs(token, "PATCH", "/api/me", { displayName: "Anna K." });
    const profile = await requestAs(token, "GET", "/api/me");

    expect(update.statusCode).toBe(204);
    expect(accountProfileSchema.parse(profile.json()).displayName).toBe("Anna K.");
  });

  it("refuses a wrong current password and changes nothing", async () => {
    const token = await signIn(ANNA);

    const response = await requestAs(token, "POST", "/api/me/password", {
      currentPassword: "not the password at all",
      newPassword: NEW_PASSWORD,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "CURRENT_PASSWORD_INCORRECT" });
    await expect(signIn(ANNA)).resolves.toEqual(expect.any(String));
  });

  it("refuses a new password that breaks the password rules", async () => {
    const token = await signIn(ANNA);

    const response = await requestAs(token, "POST", "/api/me/password", {
      currentPassword: PASSWORD,
      newPassword: "short",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "PASSWORD_TOO_SHORT" });
  });

  it("changes my password and signs out my other sessions", async () => {
    const laptop = await signIn(ANNA, "laptop");
    const phone = await signIn(ANNA, "phone");

    const response = await requestAs(laptop, "POST", "/api/me/password", {
      currentPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect(response.statusCode).toBe(204);
    await expect(signIn({ email: ANNA.email, password: NEW_PASSWORD })).resolves.toEqual(
      expect.any(String),
    );
    const oldPasswordSignIn = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in",
      payload: { email: ANNA.email, password: PASSWORD },
    });
    expect(oldPasswordSignIn.statusCode).toBe(401);
    expect((await requestAs(phone, "GET", "/api/me")).statusCode).toBe(401);
    expect((await requestAs(laptop, "GET", "/api/me")).statusCode).toBe(200);
  });

  it("lists my sessions and marks the one I am using", async () => {
    const laptop = await signIn(ANNA, "laptop");
    await signIn(ANNA, "phone");

    const response = await requestAs(laptop, "GET", "/api/me/sessions");
    const { sessions } = sessionListSchema.parse(response.json());

    expect(response.statusCode).toBe(200);
    expect(sessions).toHaveLength(3);
    expect(sessions.filter((session) => session.current)).toEqual([
      expect.objectContaining({ deviceLabel: "laptop" }),
    ]);
  });

  it("ends one of my other sessions", async () => {
    const laptop = await signIn(ANNA, "laptop");
    const phone = await signIn(ANNA, "phone");
    const phoneSession = (await requestAs(phone, "GET", "/api/me/sessions"))
      .json()
      .sessions.find((session: { current: boolean }) => session.current);

    const response = await requestAs(laptop, "DELETE", `/api/me/sessions/${phoneSession.id}`);

    expect(response.statusCode).toBe(204);
    expect((await requestAs(phone, "GET", "/api/me")).statusCode).toBe(401);
    expect((await requestAs(laptop, "GET", "/api/me")).statusCode).toBe(200);
  });

  it("refuses to end a session that belongs to someone else", async () => {
    const adminToken = await signIn(ANNA);
    await requestAs(adminToken, "PATCH", "/api/admin/instance-settings", {
      registrationOpen: true,
    });
    await app.inject({ method: "POST", url: "/api/auth/register", payload: BEN });
    const benToken = await signIn(BEN);
    const benSession = await currentSessionOf(benToken);

    const response = await requestAs(adminToken, "DELETE", `/api/me/sessions/${benSession.id}`);

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ code: "NOT_FOUND" });
    expect((await requestAs(benToken, "GET", "/api/me")).statusCode).toBe(200);
  });

  it("signs out everywhere except the session I am using", async () => {
    const laptop = await signIn(ANNA, "laptop");
    const phone = await signIn(ANNA, "phone");
    const tablet = await signIn(ANNA, "tablet");

    const response = await requestAs(laptop, "POST", "/api/me/sessions/sign-out-others");

    expect(response.statusCode).toBe(204);
    expect((await requestAs(laptop, "GET", "/api/me")).statusCode).toBe(200);
    expect((await requestAs(phone, "GET", "/api/me")).statusCode).toBe(401);
    expect((await requestAs(tablet, "GET", "/api/me")).statusCode).toBe(401);
  });

  it("refuses to regenerate the recovery code with the wrong password", async () => {
    const token = await signIn(ANNA);

    const response = await requestAs(token, "POST", "/api/me/recovery-code", {
      password: "wrong password here",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "PASSWORD_INCORRECT" });
    const rows = await admin.query(
      "SELECT retired_at FROM identity.recovery_code WHERE retired_at IS NULL",
    );
    expect(rows.rowCount).toBe(1);
  });

  it("shows a new recovery code once and retires the old one", async () => {
    const token = await signIn(ANNA);
    const [oldCode] = (
      await admin.query<{ code_hash: string }>("SELECT code_hash FROM identity.recovery_code")
    ).rows;

    const response = await requestAs(token, "POST", "/api/me/recovery-code", {
      password: PASSWORD,
    });

    expect(response.statusCode).toBe(201);
    expect(response.headers["cache-control"]).toBe("no-store");
    const { recoveryCode } = recoveryCodeIssuedSchema.parse(response.json());
    const active = await admin.query<{ code_hash: string }>(
      "SELECT code_hash FROM identity.recovery_code WHERE retired_at IS NULL",
    );
    expect(active.rows).toEqual([{ code_hash: sha256Hex(recoveryCode) }]);
    expect(active.rows[0]?.code_hash).not.toBe(oldCode?.code_hash);
  });
});
