// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import Fastify, { type FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  startIdentityTestDatabase,
  type IdentityTestDatabase,
} from "../../../test/start-identity-test-database.js";
import { renewSession } from "../../application/sessions/renew-session.js";
import { SessionEndedError } from "../../application/errors/session-ended-error.js";
import { signIn } from "../../application/sessions/sign-in.js";
import {
  CLIENT_REQUEST_HEADER,
  REFRESH_REUSE_GRACE_MS,
  SIGN_IN_FAILURE_LIMIT,
  SIGN_IN_LOCKOUT_MS,
} from "../../constants.js";
import { registerIdentityRoutes } from "../register-identity-routes.js";

const PASSWORD = "correct horse battery staple";
const ANNA = { displayName: "Anna", email: "anna@example.com", password: PASSWORD };
const anonymousUserId = () => null;
const anonymousSessionId = () => null;
const CLIENT_HEADERS = { [CLIENT_REQUEST_HEADER]: "1" };

const refreshCookieOf = (setCookie: string | string[] | undefined): string => {
  const header = Array.isArray(setCookie) ? setCookie.join(";") : (setCookie ?? "");
  const match = /offgrid_refresh=([A-Za-z0-9_-]+)/.exec(header);
  if (match?.[1] === undefined) {
    throw new Error("no refresh cookie in response");
  }
  return match[1];
};

describe("sign-in, refresh and sign-out routes", { timeout: 60_000 }, () => {
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
    app = Fastify();
    await app.register(
      async (api) =>
        registerIdentityRoutes(api, {
          db: db.db,
          currentUserId: anonymousUserId,
          currentSessionId: anonymousSessionId,
        }),
      { prefix: "/api" },
    );
    await app.inject({ method: "POST", url: "/api/auth/register", payload: ANNA });
  });

  afterEach(async () => {
    await app.close();
  });

  const postSignIn = (payload: Record<string, unknown>) =>
    app.inject({ method: "POST", url: "/api/auth/sign-in", payload });

  const postRefresh = (refreshToken: string) =>
    app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      headers: { ...CLIENT_HEADERS, cookie: `offgrid_refresh=${refreshToken}` },
    });

  it("signs in with the right password and sets the refresh cookie", async () => {
    const response = await postSignIn({ email: ANNA.email, password: PASSWORD });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: { email: ANNA.email, instanceRole: "admin" },
      accessToken: expect.any(String),
    });
    expect(response.headers["set-cookie"]).toMatch(/offgrid_refresh=.+; HttpOnly; SameSite=Strict/);
  });

  it("gives the same generic error for a wrong password and an unknown email", async () => {
    const wrongPassword = await postSignIn({
      email: ANNA.email,
      password: "not the password at all",
    });
    const unknownEmail = await postSignIn({ email: "ben@example.com", password: PASSWORD });

    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownEmail.statusCode).toBe(401);
    expect(unknownEmail.json()).toEqual(wrongPassword.json());
  });

  it("refuses sign-in after repeated failures, even with the right password", async () => {
    for (let attempt = 0; attempt < SIGN_IN_FAILURE_LIMIT; attempt += 1) {
      await postSignIn({ email: ANNA.email, password: "wrong wrong wrong wrong" });
    }

    const response = await postSignIn({ email: ANNA.email, password: PASSWORD });

    expect(response.statusCode).toBe(401);
  });

  it("lets the person try again after the lockout period", async () => {
    for (let attempt = 0; attempt < SIGN_IN_FAILURE_LIMIT; attempt += 1) {
      await postSignIn({ email: ANNA.email, password: "wrong wrong wrong wrong" });
    }
    const afterLockout = Date.now() + SIGN_IN_LOCKOUT_MS + 1;

    const session = await signIn(db.db, { email: ANNA.email, password: PASSWORD }, afterLockout);

    expect(session.user.email).toBe(ANNA.email);
  });

  it("accepts the replaced renewal credential inside the grace window only", async () => {
    const signedIn = await postSignIn({ email: ANNA.email, password: PASSWORD });
    const original = refreshCookieOf(signedIn.headers["set-cookie"]);
    const rotatedAt = new Date();

    const renewed = await renewSession(db.db, original, rotatedAt);
    expect(renewed.refreshToken).not.toBeNull();
    expect(renewed.refreshToken).not.toBe(original);

    const inGrace = await renewSession(db.db, original, new Date(rotatedAt.getTime() + 1_000));
    expect(inGrace.refreshToken).toBeNull();

    const afterGrace = new Date(rotatedAt.getTime() + REFRESH_REUSE_GRACE_MS + 1_000);
    await expect(renewSession(db.db, original, afterGrace)).rejects.toThrow(SessionEndedError);
  });

  it("refuses a refresh that is missing the request header", async () => {
    const signedIn = await postSignIn({ email: ANNA.email, password: PASSWORD });
    const token = refreshCookieOf(signedIn.headers["set-cookie"]);

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      headers: { cookie: `offgrid_refresh=${token}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it("ends the session on sign-out so it can no longer be renewed", async () => {
    const signedIn = await postSignIn({ email: ANNA.email, password: PASSWORD });
    const token = refreshCookieOf(signedIn.headers["set-cookie"]);

    const signOut = await app.inject({
      method: "POST",
      url: "/api/auth/sign-out",
      headers: { ...CLIENT_HEADERS, cookie: `offgrid_refresh=${token}` },
    });
    const refresh = await postRefresh(token);

    expect(signOut.statusCode).toBe(204);
    expect(signOut.headers["set-cookie"]).toMatch(/^offgrid_refresh=;.*Expires=Thu, 01 Jan 1970/);
    expect(refresh.statusCode).toBe(401);
    expect(refresh.json()).toMatchObject({ code: "SESSION_ENDED" });
  });

  it("refuses sign-in and renewal for a disabled account", async () => {
    const signedIn = await postSignIn({ email: ANNA.email, password: PASSWORD });
    const token = refreshCookieOf(signedIn.headers["set-cookie"]);
    await db.admin.query("UPDATE identity.user_account SET status = 'disabled'");

    const signInAgain = await postSignIn({ email: ANNA.email, password: PASSWORD });
    const refresh = await postRefresh(token);

    expect(signInAgain.statusCode).toBe(401);
    expect(refresh.statusCode).toBe(401);
  });
});
