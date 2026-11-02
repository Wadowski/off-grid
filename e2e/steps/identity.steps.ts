// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createBdd } from "playwright-bdd";
import { ensureRunAdmin, setRegistrationOpen } from "../support/factories/instance-admin.js";
import {
  registerAccount,
  registrationStatus,
  STRONG_PASSWORD,
  uniqueEmail,
  type RegistrationResult,
} from "../support/factories/identity.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

function registrationOf(world: ScenarioWorld): RegistrationResult {
  if (world.registration === undefined) {
    throw new Error("No registration was attempted in this scenario.");
  }
  return world.registration;
}

function addressFor(world: ScenarioWorld, literal: string): string {
  world.emailTag ??= randomUUID().slice(0, 8);
  return literal.replace("@", `+${world.emailTag}@`);
}

function bodyOf(registration: RegistrationResult): Record<string, unknown> {
  return registration.body as Record<string, unknown>;
}

Given("Offgrid is running", async ({ world }) => {
  const response = await world.api.get("/api/health");
  expect(response.status()).toBe(200);
});

Given("a fresh Offgrid server with no accounts", async ({ world }) => {
  const status = (await registrationStatus(world.api)) as { freshServer: boolean };
  expect(status.freshServer, "the server already has accounts").toBe(true);
});

Given("an admin account exists and registration is open", async ({ world }) => {
  await ensureRunAdmin(world.api);
});

Given("an admin account exists and registration is closed", async ({ world }) => {
  const admin = await ensureRunAdmin(world.api);
  world.registrationTouched = true;
  const response = await setRegistrationOpen(world.api, admin, false);
  expect(response.status()).toBe(200);
});

Given("an account with email {string} exists", async ({ world }, email: string) => {
  const registration = await registerAccount(world.api, { email: addressFor(world, email) });
  expect(registration.status, JSON.stringify(registration.body)).toBe(201);
});

When("someone registers with a valid name, email and password", async ({ world }) => {
  world.registration = await registerAccount(world.api, { email: uniqueEmail("valid") });
});

When("another person registers", async ({ world }) => {
  world.registration = await registerAccount(world.api, { email: uniqueEmail("another") });
});

When("someone tries to register", async ({ world }) => {
  world.registration = await registerAccount(world.api, { email: uniqueEmail("closed") });
});

When("someone registers with a password shorter than 12 characters", async ({ world }) => {
  world.registration = await registerAccount(world.api, {
    email: uniqueEmail("short"),
    password: "short-pass",
  });
});

When("someone registers with {string}", async ({ world }, email: string) => {
  world.registration = await registerAccount(world.api, {
    email: addressFor(world, email),
    password: STRONG_PASSWORD,
  });
});

When("the web app asks for the registration status", async ({ world }) => {
  world.registrationStatus = await registrationStatus(world.api);
});

Then("the account is created with the admin role", async ({ world }) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(201);
  expect(bodyOf(registration).user).toMatchObject({ instanceRole: "admin" });
});

Then("the account is created with the user role", async ({ world }) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(201);
  expect(bodyOf(registration).user).toMatchObject({ instanceRole: "user" });
});

Then("a recovery code is shown once", async ({ world }) => {
  expect(bodyOf(registrationOf(world)).recoveryCode).toEqual(expect.any(String));
});

Then("registration is refused with a {string} message", async ({ world }, message: string) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(403);
  expect(bodyOf(registration).code).toBe("REGISTRATION_CLOSED");
  expect(String(bodyOf(registration).message).toLowerCase()).toContain(message);
});

Then("the account is not created and the reason is explained", async ({ world }) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(400);
  expect(bodyOf(registration).code).toBe("PASSWORD_TOO_SHORT");
});

Then("the account is not created", async ({ world }) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(409);
  expect(bodyOf(registration).code).toBe("EMAIL_TAKEN");
});

Then("the new user has an active session", async ({ world }) => {
  const registration = registrationOf(world);
  expect(registration.status).toBe(201);
  expect(registration.setCookie).toMatch(/offgrid_refresh=.+HttpOnly/);
});

Then("it is told that the server is fresh and registration is open", async ({ world }) => {
  expect(world.registrationStatus).toEqual({ freshServer: true, registrationOpen: true });
});
