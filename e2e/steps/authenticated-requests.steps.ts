// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import type { Session } from "../support/factories/instance-admin.js";
import { signedInPerson, type SignedInPerson } from "../support/factories/notifications.js";

const { Given, When, Then } = createBdd(test);

const FAMILY_HEADER = "x-offgrid-family-id";

const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

const annaOf = async (world: ScenarioWorld): Promise<SignedInPerson> => {
  world.people ??= {};
  world.people.anna ??= await signedInPerson(world.api, "Anna");
  return world.people.anna;
};

const createFamilyAs = async (
  api: APIRequestContext,
  session: Session,
  name: string,
): Promise<{ id: string; name: string }> => {
  const response = await api.post("/api/families", {
    headers: bearer(session),
    data: { name },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create the family "${name}"`).toBe(201);
  return (await response.json()) as { id: string; name: string };
};

const rememberFamily = (world: ScenarioWorld, family: { id: string; name: string }): void => {
  world.families.push(family);
};

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((candidate) => candidate.name === name);
  if (family === undefined) {
    throw new Error(`No family named "${name}" is known in this scenario.`);
  }
  return family.id;
};

const requestActingIn = (
  api: APIRequestContext,
  session: Session,
  familyId: string,
): Promise<APIResponse> =>
  api.get("/api/me", {
    headers: { ...bearer(session), [FAMILY_HEADER]: familyId },
    failOnStatusCode: false,
  });

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  world.response = {
    status: response.status(),
    body: await response.json().catch(() => undefined),
  };
};

When("a request without a session reaches a protected endpoint", async ({ world }) => {
  await recordResponse(world, await world.api.get("/api/me", { failOnStatusCode: false }));
});

Then("it is refused with {string}", ({ world }, code: string) => {
  expect(world.response?.status).toBeGreaterThanOrEqual(400);
  expect(world.response?.body).toMatchObject({ code });
});

When("anyone calls the health endpoint", async ({ world }) => {
  await recordResponse(world, await world.api.get("/api/health", { failOnStatusCode: false }));
});

Then("it responds without a session", ({ world }) => {
  expect(world.response?.status).toBe(200);
});

When("she creates the family {string}", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  const family = await createFamilyAs(world.api, anna.session, name);
  rememberFamily(world, family);
});

Then("Anna is its first member", async ({ world }) => {
  const anna = await annaOf(world);
  const response = await requestActingIn(world.api, anna.session, familyIdNamed(world, "Kowalski"));
  expect(response.status()).toBe(200);
});

Given("Anna belongs to {string} and {string}", async ({ world }, first: string, second: string) => {
  const anna = await annaOf(world);
  rememberFamily(world, await createFamilyAs(world.api, anna.session, first));
  rememberFamily(world, await createFamilyAs(world.api, anna.session, second));
});

When("she opens {string} data while acting in that family", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  await recordResponse(
    world,
    await requestActingIn(world.api, anna.session, familyIdNamed(world, name)),
  );
});

Then("the request succeeds with that family's context", ({ world }) => {
  expect(world.response?.status).toBe(200);
});

Given("another person already has a family named {string}", async ({ world }, name: string) => {
  const ben = await signedInPerson(world.api, "Ben");
  world.people ??= {};
  world.people.ben = ben;
  rememberFamily(world, await createFamilyAs(world.api, ben.session, name));
});

When("Anna sends a request acting in {string}", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  await recordResponse(
    world,
    await requestActingIn(world.api, anna.session, familyIdNamed(world, name)),
  );
});

Given("Anna has created the family {string}", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  rememberFamily(world, await createFamilyAs(world.api, anna.session, name));
});

Given("Anna was removed from {string}", ({ world }, name: string) => {
  throw new Error(
    `Removing Anna from "${name}" for ${world.userId ?? "no user"} is not part of the product yet (OG-49 follow-up).`,
  );
});

When("she sends a request acting in {string}", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  await recordResponse(
    world,
    await requestActingIn(world.api, anna.session, familyIdNamed(world, name)),
  );
});

Then("it is refused even though her session is still valid", async ({ world }) => {
  const anna = await annaOf(world);
  expect(world.response?.status).toBeGreaterThanOrEqual(400);
  const session = await world.api.get("/api/me", {
    headers: bearer(anna.session),
    failOnStatusCode: false,
  });
  expect(session.status()).toBe(200);
});

When("Anna chooses {string} as the family she is acting in", async ({ world }, name: string) => {
  const anna = await annaOf(world);
  await recordResponse(
    world,
    await world.api.put("/api/families/active", {
      headers: bearer(anna.session),
      data: { familyId: familyIdNamed(world, name) },
      failOnStatusCode: false,
    }),
  );
});

Then("the choice is confirmed for {string}", ({ world }, name: string) => {
  expect(world.response?.status).toBe(200);
  expect(world.response?.body).toEqual({ familyId: familyIdNamed(world, name) });
});
