// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { recoveryCodeMailedTo } from "../support/mail-catcher.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import {
  completePasswordReset,
  NEW_PASSWORD,
  signInWith,
  type Session,
} from "../support/factories/instance-admin.js";
import {
  waitForOwnNotifications,
  type SignedInPerson,
} from "../support/factories/notifications.js";

const { Given, When, Then } = createBdd(test);

const WRONG_RECOVERY_CODE = "WRONG-CODE-0000";
const OTHER_PASSWORD = "yet another long passphrase";
const RECOVERY_FAILURE_LIMIT = 5;
const PASSWORD_CHANGED_TYPE = "password-changed";

const recoveryAccountOf = (world: ScenarioWorld) => {
  if (world.recoveryAccount === undefined) {
    throw new Error("Anna has no account in this scenario.");
  }
  return world.recoveryAccount;
};

const createRecoveryAccount = async (world: ScenarioWorld): Promise<void> => {
  const email = uniqueEmail("anna");
  const registration = await registerAccount(world.api, { email, displayName: "Anna" });
  expect(registration.status).toBe(201);
  const body = registration.body as { recoveryCode: string };
  world.recoveryAccount = { email, password: STRONG_PASSWORD, recoveryCode: body.recoveryCode };
};

const postRecovery = (
  api: APIRequestContext,
  email: string,
  recoveryCode: string,
  password: string,
): Promise<APIResponse> =>
  api.post("/api/auth/password-recovery", {
    data: { email, recoveryCode, password },
    failOnStatusCode: false,
  });

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  world.response = {
    status: response.status(),
    body: await response.json().catch(() => undefined),
  };
};

const requestEmailCode = (api: APIRequestContext, email: string): Promise<APIResponse> =>
  api.post("/api/auth/password-recovery/email-code", {
    data: { email },
    failOnStatusCode: false,
  });

const signedInAs = async (
  api: APIRequestContext,
  account: { email: string; password: string; userId?: string },
): Promise<SignedInPerson> => {
  const { session, body } = await signInWith(api, account.email, account.password);
  if (session === undefined) {
    throw new Error(`${account.email} cannot sign in`);
  }
  return {
    userId: session.userId,
    email: account.email,
    password: account.password,
    session,
    recoveryCode: (body as { recoveryCode?: string }).recoveryCode,
  };
};

const canSignIn = async (
  api: APIRequestContext,
  email: string,
  password: string,
): Promise<boolean> => {
  const { status } = await signInWith(api, email, password);
  return status === 200;
};

const sessionIsLive = async (api: APIRequestContext, session: Session): Promise<boolean> => {
  const response = await api.get("/api/me/sessions", {
    headers: { authorization: `Bearer ${session.accessToken}` },
    failOnStatusCode: false,
  });
  return response.status() === 200;
};

Given("Anna has an account", async ({ world }) => {
  await createRecoveryAccount(world);
});

Given("Anna has already reset her password with her recovery code", async ({ world }) => {
  await createRecoveryAccount(world);
  const account = recoveryAccountOf(world);
  const response = await postRecovery(
    world.api,
    account.email,
    account.recoveryCode ?? "",
    NEW_PASSWORD,
  );
  expect(response.status()).toBe(200);
  account.password = NEW_PASSWORD;
  account.newRecoveryCode = ((await response.json()) as { recoveryCode: string }).recoveryCode;
});

Given("Anna has asked for an emailed code", async ({ world }) => {
  const response = await requestEmailCode(world.api, recoveryAccountOf(world).email);
  expect(response.status()).toBe(202);
});

Given("Anna is signed in on another device", async ({ world }) => {
  world.people ??= {};
  world.people.annaOther = await signedInAs(world.api, recoveryAccountOf(world));
});

When("she resets her password with email, recovery code and a new password", async ({ world }) => {
  const account = recoveryAccountOf(world);
  const response = await postRecovery(
    world.api,
    account.email,
    account.recoveryCode ?? "",
    NEW_PASSWORD,
  );
  await recordResponse(world, response);
  if (response.status() === 200) {
    account.password = NEW_PASSWORD;
    account.newRecoveryCode = (world.response?.body as { recoveryCode: string }).recoveryCode;
  }
});

Then("she can sign in with the new password", async ({ world }) => {
  const account = recoveryAccountOf(world);
  expect(await canSignIn(world.api, account.email, account.password)).toBe(true);
});

Then("she receives a new recovery code", ({ world }) => {
  const account = recoveryAccountOf(world);
  expect(world.response?.status).toBe(200);
  expect(account.newRecoveryCode).toEqual(expect.any(String));
  expect(account.newRecoveryCode).not.toBe(account.recoveryCode);
});

When("someone uses that recovery code again", async ({ world }) => {
  const account = recoveryAccountOf(world);
  const response = await postRecovery(
    world.api,
    account.email,
    account.recoveryCode ?? "",
    OTHER_PASSWORD,
  );
  await recordResponse(world, response);
});

Then("the reset is refused and the password does not change", async ({ world }) => {
  const account = recoveryAccountOf(world);
  expect(world.response?.status).toBe(400);
  expect(world.response?.body).toMatchObject({ code: "INVALID_RECOVERY_CODE" });
  expect(await canSignIn(world.api, account.email, OTHER_PASSWORD)).toBe(false);
  expect(await canSignIn(world.api, account.email, account.password)).toBe(true);
});

When("someone tries five wrong recovery codes for her email", async ({ world }) => {
  const account = recoveryAccountOf(world);
  for (let attempt = 0; attempt < RECOVERY_FAILURE_LIMIT; attempt++) {
    await postRecovery(world.api, account.email, WRONG_RECOVERY_CODE, NEW_PASSWORD);
  }
});

Then("further attempts are temporarily refused", async ({ world }) => {
  const account = recoveryAccountOf(world);
  const response = await postRecovery(
    world.api,
    account.email,
    account.recoveryCode ?? "",
    NEW_PASSWORD,
  );
  await recordResponse(world, response);
  expect(world.response?.status).toBe(429);
  expect(world.response?.body).toMatchObject({ code: "RECOVERY_LOCKED" });
});

When("Anna asks for an emailed code", async ({ world }) => {
  const response = await requestEmailCode(world.api, recoveryAccountOf(world).email);
  await recordResponse(world, response);
});

Then("a code is emailed to her valid for 10 minutes", async ({ world }) => {
  expect(world.response?.status).toBe(202);
  expect(await recoveryCodeMailedTo(recoveryAccountOf(world).email)).toEqual(expect.any(String));
});

When("she resets her password with that emailed code and a new password", async ({ world }) => {
  const account = recoveryAccountOf(world);
  const code = await recoveryCodeMailedTo(account.email);
  const response = await completePasswordReset(world.api, account.email, code, NEW_PASSWORD);
  await recordResponse(world, response);
  account.password = NEW_PASSWORD;
});

When("someone asks for an emailed code for an email without an account", async ({ world }) => {
  const known = await requestEmailCode(world.api, recoveryAccountOf(world).email);
  const unknown = await requestEmailCode(world.api, uniqueEmail("nobody"));
  world.response = { status: known.status(), body: undefined };
  world.unknownEmailFailure = { status: unknown.status(), body: undefined };
});

Then("the response looks the same as for an existing account", ({ world }) => {
  expect(world.unknownEmailFailure?.status).toBe(world.response?.status);
});

Then("the other device is signed out", async ({ world }) => {
  const other = world.people?.annaOther;
  if (other === undefined) {
    throw new Error("Anna has no other device in this scenario.");
  }
  expect(await sessionIsLive(world.api, other.session)).toBe(false);
});

Then("she gets a security notification in her inbox", async ({ world }) => {
  const account = recoveryAccountOf(world);
  const signedIn = await signedInAs(world.api, { ...account, password: NEW_PASSWORD });
  const inbox = await waitForOwnNotifications(world.api, signedIn.session, (list) =>
    list.notifications.some((item) => item.type === PASSWORD_CHANGED_TYPE),
  );
  expect(inbox.body.notifications.map((item) => item.type)).toContain(PASSWORD_CHANGED_TYPE);
});
