// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createBdd } from "playwright-bdd";
import {
  accessWithToken,
  completePasswordReset,
  createMember,
  ensureRunAdmin,
  forgetRunAdminSession,
  issuedCodeFrom,
  listUsers,
  NEW_PASSWORD,
  RUN_ADMIN_EMAIL,
  runRecoveryCommand,
  setRegistrationOpen,
  setUserDisabled,
  signInWith,
  startPasswordResetFor,
  type JsonResponse,
  type Member,
  type Session,
} from "../support/factories/instance-admin.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then, After } = createBdd(test);

const ONE_TIME_CODE_PATTERN = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/;

function adminOf(world: ScenarioWorld): Session {
  if (world.admin === undefined) {
    throw new Error("The admin has not been set up in this scenario.");
  }
  return world.admin;
}

function memberOf(world: ScenarioWorld): Member {
  if (world.member === undefined) {
    throw new Error("No member has been created in this scenario.");
  }
  return world.member;
}

function responseOf(world: ScenarioWorld): JsonResponse {
  if (world.response === undefined) {
    throw new Error("No admin request was made in this scenario.");
  }
  return world.response;
}

async function ensureMember(world: ScenarioWorld): Promise<Member> {
  world.member ??= await createMember(world.api, "tom");
  return world.member;
}

async function setRegistration(world: ScenarioWorld, open: boolean): Promise<void> {
  const admin = await ensureRunAdmin(world.api);
  world.registrationTouched = true;
  const response = await setRegistrationOpen(world.api, admin, open);
  expect(response.status(), "could not change registration").toBe(200);
}

After(async ({ world }) => {
  if (world.registrationTouched !== true) {
    return;
  }
  const admin = await ensureRunAdmin(world.api);
  await setRegistrationOpen(world.api, admin, true);
});

Given("I am the admin", async ({ world }) => {
  world.admin = await ensureRunAdmin(world.api);
});

Given("I am a regular user", async ({ world }) => {
  const member = await ensureMember(world);
  const session = await signInWith(world.api, member.email, member.password);
  expect(session.status, "the regular user cannot sign in").toBe(200);
});

Given("only one active admin exists", async ({ world }) => {
  const admin = await ensureRunAdmin(world.api);
  world.admin = admin;
  const response = await listUsers(world.api, admin);
  const body = (await response.json()) as { users: { instanceRole: string; status: string }[] };
  const activeAdmins = body.users.filter(
    (user) => user.instanceRole === "admin" && user.status === "active",
  );
  expect(activeAdmins).toHaveLength(1);
});

Then("I can see every account with its role and status", async ({ world }) => {
  const response = await listUsers(world.api, adminOf(world));
  expect(response.status()).toBe(200);
  const body = (await response.json()) as {
    users: { email: string; instanceRole: string; status: string }[];
  };
  expect(body.users).toContainEqual(
    expect.objectContaining({ email: RUN_ADMIN_EMAIL, instanceRole: "admin", status: "active" }),
  );
});

When("I open the admin user list", async ({ world }) => {
  const member = memberOf(world);
  const session = await signInWith(world.api, member.email, member.password);
  expect(session.session).toBeDefined();
  const response = await listUsers(world.api, session.session!);
  world.response = { status: response.status(), body: await response.json() };
});

Then("I am refused", async ({ world }) => {
  expect(responseOf(world).status).toBe(403);
});

When("the admin disables Tom's account", async ({ world }) => {
  const tom = await ensureMember(world);
  const session = await signInWith(world.api, tom.email, tom.password);
  expect(session.session).toBeDefined();
  world.memberAccessToken = session.session?.accessToken;
  world.admin = await ensureRunAdmin(world.api);
  const response = await setUserDisabled(world.api, world.admin, tom.userId, true);
  world.response = { status: response.status(), body: await response.json() };
});

Then("Tom's sessions end and he cannot sign in", async ({ world }) => {
  expect(responseOf(world).status).toBe(200);
  const tom = memberOf(world);
  const signIn = await signInWith(world.api, tom.email, tom.password);
  expect(signIn.status).toBe(401);
  const staleAccess = await accessWithToken(world.api, world.memberAccessToken ?? "");
  expect(staleAccess.status()).toBe(401);
});

When("that admin tries to disable their own account", async ({ world }) => {
  const admin = adminOf(world);
  const response = await setUserDisabled(world.api, admin, admin.userId, true);
  world.response = { status: response.status(), body: await response.json() };
});

Then("it is refused", async ({ world }) => {
  expect(responseOf(world).status).toBe(409);
});

When("the admin starts a password reset for Tom", async ({ world }) => {
  const tom = await ensureMember(world);
  world.admin = await ensureRunAdmin(world.api);
  const response = await startPasswordResetFor(world.api, world.admin, tom.userId);
  world.response = { status: response.status(), body: await response.json() };
  world.issuedCode = (world.response.body as { code: string }).code;
});

Then("a one-time code is shown to the admin", async ({ world }) => {
  expect(responseOf(world).status).toBe(201);
  expect(world.issuedCode).toMatch(ONE_TIME_CODE_PATTERN);
});

Then("Tom can set a new password with it, once", async ({ world }) => {
  const tom = memberOf(world);
  const code = world.issuedCode ?? "";
  const first = await completePasswordReset(world.api, code, NEW_PASSWORD);
  expect(first.status()).toBe(204);
  const second = await completePasswordReset(world.api, code, NEW_PASSWORD);
  expect(second.status()).toBe(400);
  const signIn = await signInWith(world.api, tom.email, NEW_PASSWORD);
  expect(signIn.status).toBe(200);
});

When("the admin closes registration", async ({ world }) => {
  await setRegistration(world, false);
});

Then("new sign-ups are refused", async ({ world }) => {
  const registration = await registerAccount(world.api, { email: uniqueEmail("late") });
  expect(registration.status).toBe(403);
  expect((registration.body as { code: string }).code).toBe("REGISTRATION_CLOSED");
});

Given("no admin can sign in", async ({ world }) => {
  const issued = issuedCodeFrom(
    await runRecoveryCommand(["reset-password", "--email", RUN_ADMIN_EMAIL]),
  );
  const forgottenPassword = randomUUID();
  const reset = await completePasswordReset(world.api, issued, forgottenPassword);
  expect(reset.status()).toBe(204);
  const signIn = await signInWith(world.api, RUN_ADMIN_EMAIL, STRONG_PASSWORD);
  expect(signIn.status).toBe(401);
  forgetRunAdminSession();
});

When("the server owner runs the recovery command on the server", async ({ world }) => {
  world.issuedCode = issuedCodeFrom(
    await runRecoveryCommand(["reset-password", "--email", RUN_ADMIN_EMAIL]),
  );
});

Then("the admin password is reset", async ({ world }) => {
  const reset = await completePasswordReset(world.api, world.issuedCode ?? "", STRONG_PASSWORD);
  expect(reset.status()).toBe(204);
  const signIn = await signInWith(world.api, RUN_ADMIN_EMAIL, STRONG_PASSWORD);
  expect(signIn.status).toBe(200);
  forgetRunAdminSession();
});
