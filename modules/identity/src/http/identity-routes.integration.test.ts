// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../test/start-identity-test-database.js";
import { registerIdentityRoutes } from "./register-identity-routes.js";

const STRONG_PASSWORD = "correct horse battery staple";

const anonymousUserId = () => null;

describe("identity registration routes", { timeout: 60_000 }, () => {
  let db: IdentityTestDatabase;
  let app: FastifyInstance;

  beforeAll(async () => {
    db = await startIdentityTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  });

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("UPDATE identity.instance_settings SET registration_open = true");
    app = Fastify();
    await app.register(
      async (api) => registerIdentityRoutes(api, { db: db.db, currentUserId: anonymousUserId }),
      { prefix: "/api" },
    );
  });

  afterEach(async () => {
    await app.close();
  });

  const postRegister = (payload: Record<string, unknown>) =>
    app.inject({ method: "POST", url: "/api/auth/register", payload });

  it("creates the first account, sets the refresh cookie and returns the recovery code once", async () => {
    const response = await postRegister({
      displayName: "Anna",
      email: "anna@example.com",
      password: STRONG_PASSWORD,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{
      user: { instanceRole: string; email: string };
      recoveryCode: string;
    }>();
    expect(body.user).toMatchObject({ instanceRole: "admin", email: "anna@example.com" });
    expect(body.recoveryCode).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(response.headers["set-cookie"]).toMatch(
      /^offgrid_refresh=[A-Za-z0-9_-]+; Path=\/api\/auth; Expires=.+; HttpOnly; SameSite=Strict$/,
    );
  });

  it("never returns the password or the stored hashes", async () => {
    const response = await postRegister({
      displayName: "Anna",
      email: "anna@example.com",
      password: STRONG_PASSWORD,
    });

    expect(response.body).not.toContain(STRONG_PASSWORD);
    expect(response.body).not.toContain("argon2id");
  });

  it("returns VALIDATION_FAILED for a malformed email", async () => {
    const response = await postRegister({
      displayName: "Anna",
      email: "not-an-email",
      password: STRONG_PASSWORD,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "VALIDATION_FAILED" });
  });

  it("returns the first failing password rule as its code", async () => {
    const response = await postRegister({
      displayName: "Anna",
      email: "anna@example.com",
      password: "short-pass",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "PASSWORD_TOO_SHORT" });
  });

  it("returns EMAIL_TAKEN when the email is already used, ignoring case", async () => {
    await postRegister({
      displayName: "Anna",
      email: "anna@example.com",
      password: STRONG_PASSWORD,
    });

    const response = await postRegister({
      displayName: "Anna Two",
      email: "Anna@Example.com",
      password: "another long passphrase",
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({ code: "EMAIL_TAKEN" });
  });

  it("returns REGISTRATION_CLOSED with 403 while registration is closed", async () => {
    await postRegister({
      displayName: "Anna",
      email: "anna@example.com",
      password: STRONG_PASSWORD,
    });
    await db.admin.query("UPDATE identity.instance_settings SET registration_open = false");

    const response = await postRegister({
      displayName: "Ben",
      email: "ben@example.com",
      password: "another long passphrase",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({ code: "REGISTRATION_CLOSED" });
  });

  it("reports a fresh server with registration open", async () => {
    const response = await app.inject({ method: "GET", url: "/api/auth/registration-status" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ freshServer: true, registrationOpen: true });
  });
});
