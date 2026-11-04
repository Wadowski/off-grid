// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  ensureRunAdmin,
  RUN_ADMIN_EMAIL,
  signInWith,
  type JsonResponse,
  type Session,
} from "../support/factories/instance-admin.js";
import {
  APP_PASSWORD,
  readMailSettings,
  saveMailSettings,
} from "../support/factories/mail-setup.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const CONFIGURED_SERVER = {
  provider: "other",
  email: RUN_ADMIN_EMAIL,
  password: APP_PASSWORD,
  smtpHost: "mail.example.com",
  smtpPort: 587,
  smtpSecurity: "starttls",
};

const notImplemented = (step: string): never => {
  throw new Error(`Not implemented yet: ${step}`);
};

async function toJsonResponse(response: APIResponse): Promise<JsonResponse> {
  return { status: response.status(), body: await response.json() };
}

function mailResponseOf(world: ScenarioWorld): JsonResponse {
  if (world.response === undefined) {
    throw new Error("No mail settings request was made in this scenario.");
  }
  return world.response;
}

async function regularUserSession(world: ScenarioWorld): Promise<Session> {
  if (world.member === undefined) {
    throw new Error("No regular user has been created in this scenario.");
  }
  const session = await signInWith(world.api, world.member.email, world.member.password);
  if (session.session === undefined) {
    throw new Error("The regular user could not sign in.");
  }
  return session.session;
}

Given("email is configured", async ({ world }) => {
  const admin = await ensureRunAdmin(world.api);
  world.admin = admin;
  const response = await saveMailSettings(world.api, admin, CONFIGURED_SERVER);
  expect(response.status(), "could not save mail settings").toBe(200);
});

Given("a mail catcher is the mail server", () =>
  notImplemented("a mail catcher is the mail server"),
);

Given("no mail is configured", () => notImplemented("no mail is configured"));

Given("the provider is unreachable", () => notImplemented("the provider is unreachable"));

When("I choose {word} and enter my email and app password", async ({ world }, provider: string) => {
  const admin = await ensureRunAdmin(world.api);
  world.admin = admin;
  const response = await saveMailSettings(world.api, admin, {
    provider: provider.toLowerCase(),
    email: RUN_ADMIN_EMAIL,
    password: APP_PASSWORD,
  });
  world.response = await toJsonResponse(response);
});

When("I save mail settings", async ({ world }) => {
  const member = await regularUserSession(world);
  const response = await saveMailSettings(world.api, member, {
    provider: "gmail",
    email: RUN_ADMIN_EMAIL,
    password: APP_PASSWORD,
  });
  world.response = await toJsonResponse(response);
});

When("I open the mail settings", async ({ world }) => {
  const session =
    world.member === undefined ? await ensureRunAdmin(world.api) : await regularUserSession(world);
  world.response = await toJsonResponse(await readMailSettings(world.api, session));
});

When("I send a test email to myself", () => notImplemented("I send a test email to myself"));

When("I send a test email with a wrong app password", () =>
  notImplemented("I send a test email with a wrong app password"),
);

When("a notification should be emailed", () => notImplemented("a notification should be emailed"));

Then(
  "the server details are filled in for me with host {string}, port {int} and security {string}",
  ({ world }, host: string, port: number, security: string) => {
    const response = mailResponseOf(world);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      configured: true,
      smtpHost: host,
      smtpPort: port,
      smtpSecurity: security,
    });
  },
);

Then("the saved password is not shown", ({ world }) => {
  const response = mailResponseOf(world);
  expect(response.status).toBe(200);
  expect(JSON.stringify(response.body)).not.toContain(APP_PASSWORD);
  expect(response.body).not.toHaveProperty("password");
});

Then("the test email arrives in the catcher", () =>
  notImplemented("the test email arrives in the catcher"),
);

Then("the app reports that email is unavailable", () =>
  notImplemented("the app reports that email is unavailable"),
);

Then("no part of the app depends on it", () => notImplemented("no part of the app depends on it"));

Then("the action that caused it still succeeds", () =>
  notImplemented("the action that caused it still succeeds"),
);

Then("delivery is retried later", () => notImplemented("delivery is retried later"));
