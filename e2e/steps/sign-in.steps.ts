// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import type { JsonResponse } from "../support/factories/instance-admin.js";
import { ensureRunAdmin, setUserDisabled } from "../support/factories/instance-admin.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signedInPerson } from "../support/factories/notifications.js";

const { Given, When, Then } = createBdd(test);

const WRONG_PASSWORD = "not the right password";
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
const SIGN_IN_FAILURE_ATTEMPTS = 5;
const REFRESH_COOKIE_PATTERN = /offgrid_refresh=([^;]+)/;
const CLIENT_REQUEST_HEADERS = { "x-offgrid-request": "1" };
const EXPIRES_PATTERN = /Expires=([^;]+)/;
const REMEMBER_ME_TOLERANCE_MS = 5 * 60 * 1000;

type SignInBody = { user?: { id: string }; accessToken?: string };

type Attempt = JsonResponse & { setCookie?: string };

const signInAttempt = async (
  api: APIRequestContext,
  email: string,
  password: string,
  rememberMe = false,
): Promise<Attempt> => {
  const response: APIResponse = await api.post("/api/auth/sign-in", {
    data: { email, password, rememberMe },
    failOnStatusCode: false,
  });
  return {
    status: response.status(),
    body: await response.json(),
    setCookie: refreshSetCookieOf(response),
  };
};

const refreshSetCookieOf = (response: APIResponse): string | undefined =>
  response
    .headersArray()
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .map((header) => header.value)
    .find((cookie) => cookie.startsWith("offgrid_refresh="));

const annaEmail = (world: ScenarioWorld): string => {
  world.signInEmail ??= uniqueEmail("anna");
  return world.signInEmail;
};

const createAnna = async (world: ScenarioWorld): Promise<void> => {
  const registration = await registerAccount(world.api, {
    email: annaEmail(world),
    displayName: "Anna",
  });
  expect(registration.status).toBe(201);
  world.registration = registration;
};

const annaUserId = (world: ScenarioWorld): string => {
  const body = world.registration?.body as { user?: { id: string } } | undefined;
  if (body?.user === undefined) {
    throw new Error("Anna has no account in this scenario.");
  }
  return body.user.id;
};

const refreshCookieOf = (attempt: Attempt): string => {
  const match = REFRESH_COOKIE_PATTERN.exec(attempt.setCookie ?? "");
  if (match?.[1] === undefined) {
    throw new Error("The sign-in did not set a renewal cookie.");
  }
  return match[1];
};

const REFRESH_REUSE_GRACE_MS = 30 * 1000;
const REFRESH_REUSE_GRACE_WAIT_MS = REFRESH_REUSE_GRACE_MS + 1000;
const SCENARIO_HEADROOM_MS = 30 * 1000;

const waitPastRefreshReuseGrace = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, REFRESH_REUSE_GRACE_WAIT_MS));

const refreshWith = (api: APIRequestContext, cookie: string): Promise<APIResponse> =>
  api.post("/api/auth/refresh", {
    headers: { ...CLIENT_REQUEST_HEADERS, cookie: `offgrid_refresh=${cookie}` },
    failOnStatusCode: false,
  });

const currentUserWith = (api: APIRequestContext, accessToken: string): Promise<APIResponse> =>
  api.get("/api/me", {
    headers: { authorization: `Bearer ${accessToken}` },
    failOnStatusCode: false,
  });

const tokenOf = (body: unknown): string => {
  const token = (body as SignInBody).accessToken;
  if (token === undefined) {
    throw new Error("The response carried no access token.");
  }
  return token;
};

Given("Anna has a new account", async ({ world }) => {
  await createAnna(world);
});

Given("an account for {string}", async ({ world }, email: string) => {
  const registration = await registerAccount(world.api, { email, displayName: "Anna" });
  expect(registration.status).toBe(201);
});

Given("an admin disabled Anna's account", async ({ world }) => {
  await createAnna(world);
  const admin = await ensureRunAdmin(world.api);
  const response = await setUserDisabled(world.api, admin, annaUserId(world), true);
  expect(response.status(), "the admin could not disable Anna").toBe(200);
});

Given("Anna is signed in", async ({ world }) => {
  world.people ??= {};
  const anna = await signedInPerson(world.api, "Anna");
  world.people.anna = anna;
  world.signInEmail = anna.email;
});

When("Anna signs in with the right password", async ({ world }) => {
  const attempt = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD);
  world.response = attempt;
  world.memberAccessToken = attempt.body !== undefined ? tokenOf(attempt.body) : undefined;
});

Then("she receives a session and can call protected endpoints", async ({ world }) => {
  expect(world.response?.status).toBe(200);
  const token = world.memberAccessToken;
  expect(token).toEqual(expect.any(String));
  const me = await currentUserWith(world.api, token ?? "");
  expect(me.status()).toBe(200);
});

When("Anna signs in with a wrong password", async ({ world }) => {
  world.signInFailure = await signInAttempt(world.api, annaEmail(world), WRONG_PASSWORD);
  world.response = world.signInFailure;
});

Then('sign-in fails with a generic "email or password is incorrect" message', ({ world }) => {
  expect(world.signInFailure?.status).toBe(401);
  expect(world.signInFailure?.body).toMatchObject({
    code: "INVALID_CREDENTIALS",
    message: "Email or password is incorrect",
  });
});

When("someone signs in with an email that has no account", async ({ world }) => {
  world.signInFailure = await signInAttempt(world.api, annaEmail(world), WRONG_PASSWORD);
  world.unknownEmailFailure = await signInAttempt(world.api, uniqueEmail("nobody"), WRONG_PASSWORD);
});

Then("the response is the same as for a wrong password", ({ world }) => {
  expect(world.unknownEmailFailure?.status).toBe(world.signInFailure?.status);
  expect(world.unknownEmailFailure?.body).toEqual(world.signInFailure?.body);
});

When("Anna enters a wrong password 5 times in a row", async ({ world }) => {
  for (let attempt = 0; attempt < SIGN_IN_FAILURE_ATTEMPTS; attempt++) {
    await signInAttempt(world.api, annaEmail(world), WRONG_PASSWORD);
  }
});

Then("further attempts are refused for a short time", async ({ world }) => {
  const locked = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD);
  expect(locked.status).not.toBe(200);
});

When('Anna signs in with "remember me"', async ({ world }) => {
  const attempt = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD, true);
  world.rememberMeCookie = attempt.setCookie;
  expect(attempt.status).toBe(200);
});

Then("her session stays valid for 30 days instead of the default", ({ world }) => {
  const expires = EXPIRES_PATTERN.exec(world.rememberMeCookie ?? "")?.[1];
  expect(expires, "the remember-me cookie has no expiry").toBeDefined();
  const lifetimeMs = Date.parse(expires ?? "") - Date.now();
  expect(Math.abs(lifetimeMs - THIRTY_DAYS_IN_SECONDS * 1000)).toBeLessThan(
    REMEMBER_ME_TOLERANCE_MS,
  );
});

When("the app renews her session", async ({ world }) => {
  const first = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD);
  world.refreshCookie = refreshCookieOf(first);
  const renewal = await refreshWith(world.api, world.refreshCookie);
  expect(renewal.status()).toBe(200);
  world.memberAccessToken = tokenOf(await renewal.json());
});

Then(
  "Anna gets new credentials and the old renewal credential no longer works",
  async ({ world, $testInfo }) => {
    $testInfo.setTimeout(REFRESH_REUSE_GRACE_WAIT_MS + SCENARIO_HEADROOM_MS);
    await waitPastRefreshReuseGrace();
    const oldCookie = world.refreshCookie ?? "";
    const replay = await refreshWith(world.api, oldCookie);
    expect(replay.status()).toBe(401);
    expect(world.memberAccessToken).toEqual(expect.any(String));
  },
);

When("Anna signs out", async ({ world }) => {
  const attempt = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD);
  world.refreshCookie = refreshCookieOf(attempt);
  world.memberAccessToken = tokenOf(attempt.body);
  const signOut = await world.api.post("/api/auth/sign-out", {
    headers: {
      ...CLIENT_REQUEST_HEADERS,
      authorization: `Bearer ${world.memberAccessToken}`,
      cookie: `offgrid_refresh=${world.refreshCookie}`,
    },
    failOnStatusCode: false,
  });
  expect(signOut.status()).toBeLessThan(300);
});

Then("that session can no longer be used or renewed", async ({ world }) => {
  const renewal = await refreshWith(world.api, world.refreshCookie ?? "");
  expect(renewal.status()).toBe(401);
  const me = await currentUserWith(world.api, world.memberAccessToken ?? "");
  expect(me.status()).toBe(401);
});

When("Anna tries to sign in", async ({ world }) => {
  world.response = await signInAttempt(world.api, annaEmail(world), STRONG_PASSWORD);
});

Then("she is refused", ({ world }) => {
  expect(world.response?.status).not.toBe(200);
});
