// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const LONG_NAME_LENGTH = 101;
const NOT_FOUND_CODE = "NOT_FOUND";
const VALIDATION_CODE = "VALIDATION_FAILED";

const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

const sessionOf = async (api: APIRequestContext, displayName: string): Promise<Session> => {
  const email = uniqueEmail(displayName.toLowerCase().replace(/\s+/g, "-"));
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status).toBe(201);
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${displayName} cannot sign in`).toBeDefined();
  return session as Session;
};

const memberSessionOf = (world: ScenarioWorld): Session => {
  if (world.memberAccessToken === undefined || world.userId === undefined) {
    throw new Error("No signed-in member is set up for this scenario.");
  }
  return { userId: world.userId, accessToken: world.memberAccessToken };
};

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  world.response = {
    status: response.status(),
    body: await response.json().catch(() => undefined),
  };
};

const postFamily = (api: APIRequestContext, session: Session, name: string): Promise<APIResponse> =>
  api.post("/api/families", { headers: bearer(session), data: { name }, failOnStatusCode: false });

const familyNamesOf = async (api: APIRequestContext, session: Session): Promise<string[]> => {
  const response = await api.get("/api/families", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return ((await response.json()) as { families: { name: string }[] }).families.map(
    (family) => family.name,
  );
};

Given("I am a user without any family", async ({ world }) => {
  const session = await sessionOf(world.api, "Ben Member");
  world.userId = session.userId;
  world.memberAccessToken = session.accessToken;
});

Given("another user has a family named {string}", async ({ world }, name: string) => {
  const owner = await sessionOf(world.api, "Other Person");
  const response = await postFamily(world.api, owner, name);
  expect(response.status()).toBe(201);
  world.families.push((await response.json()) as { id: string; name: string });
});

When("I create a family named {string}", async ({ world }, name: string) => {
  const response = await postFamily(world.api, memberSessionOf(world), name);
  await recordResponse(world, response);
  if (response.status() === 201) {
    world.families.push((await response.json()) as { id: string; name: string });
  }
});

When("I try to create a family with an empty name", async ({ world }) => {
  await recordResponse(world, await postFamily(world.api, memberSessionOf(world), ""));
});

When("I try to create a family with a name that is 101 characters long", async ({ world }) => {
  const name = "a".repeat(LONG_NAME_LENGTH);
  await recordResponse(world, await postFamily(world.api, memberSessionOf(world), name));
});

When("I ask for the family {string} by its identifier", async ({ world }, name: string) => {
  const family = world.families.find((created) => created.name === name);
  expect(family, `family "${name}" was not created`).toBeDefined();
  const response = await world.api.get(`/api/families/${family?.id ?? ""}`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("{string} appears in my list of families", async ({ world }, name: string) => {
  expect(await familyNamesOf(world.api, memberSessionOf(world))).toContain(name);
});

Then("{string} eventually appears in my list of families", async ({ world }, name: string) => {
  const session = memberSessionOf(world);
  await eventually(async () => {
    expect(await familyNamesOf(world.api, session)).toContain(name);
  });
});

Then("I am told that the family name is required", ({ world }) => {
  expect(world.response?.status).toBe(400);
  expect(world.response?.body).toMatchObject({ code: VALIDATION_CODE });
});

Then("I am told that the family name is too long", ({ world }) => {
  expect(world.response?.status).toBe(400);
  expect(world.response?.body).toMatchObject({ code: VALIDATION_CODE });
});

Then("I am told that the family was not found", ({ world }) => {
  expect(world.response?.status).toBe(404);
  expect(world.response?.body).toMatchObject({ code: NOT_FOUND_CODE });
});
