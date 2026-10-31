// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { ApiError } from "@offgrid/api-client";
import { createBdd } from "playwright-bdd";
import { apiClientFor, type ApiClient } from "../support/api.js";
import { eventually } from "../support/eventually.js";
import { createFamily, listFamilies } from "../support/factories/family.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

function clientFor(baseURL: string | undefined, world: ScenarioWorld): ApiClient {
  if (world.userId === undefined) {
    throw new Error("No user is set up for this scenario yet.");
  }
  return apiClientFor(baseURL ?? "", world.userId);
}

async function captureApiError(action: () => Promise<unknown>): Promise<ApiError> {
  try {
    await action();
  } catch (error) {
    if (error instanceof ApiError) {
      return error;
    }
    throw error;
  }
  throw new Error("The request succeeded, but a rejection was expected.");
}

Given("I am a user without any family", async ({ world }) => {
  world.userId = randomUUID();
});

Given("another user has a family named {string}", async ({ baseURL, world }, name: string) => {
  world.families.push(await createFamily(apiClientFor(baseURL ?? "", randomUUID()), { name }));
});

When("I create a family named {string}", async ({ baseURL, world }, name: string) => {
  world.families.push(await createFamily(clientFor(baseURL, world), { name }));
});

When("I try to create a family with an empty name", async ({ baseURL, world }) => {
  world.lastError = await captureApiError(() =>
    createFamily(clientFor(baseURL, world), { name: "" }),
  );
});

When(
  "I try to create a family with a name that is 101 characters long",
  async ({ baseURL, world }) => {
    world.lastError = await captureApiError(() =>
      createFamily(clientFor(baseURL, world), { name: "a".repeat(101) }),
    );
  },
);

When(
  "I ask for the family {string} by its identifier",
  async ({ baseURL, world }, name: string) => {
    const family = world.families.find((created) => created.name === name);
    expect(family, `family "${name}" was not created`).toBeDefined();
    world.lastError = await captureApiError(() =>
      clientFor(baseURL, world).request("GET", `/families/${family?.id ?? ""}`),
    );
  },
);

Then("{string} appears in my list of families", async ({ baseURL, world }, name: string) => {
  const families = await listFamilies(clientFor(baseURL, world));
  expect(families.map((family) => family.name)).toContain(name);
});

Then(
  "{string} eventually appears in my list of families",
  async ({ baseURL, world }, name: string) => {
    const client = clientFor(baseURL, world);
    await eventually(async () => {
      const families = await listFamilies(client);
      expect(families.map((family) => family.name)).toContain(name);
    });
  },
);

Then("I am told that the family name is required", async ({ world }) => {
  expect(world.lastError?.status).toBe(400);
  expect(world.lastError?.message).toMatch(/name/i);
});

Then("I am told that the family name is too long", async ({ world }) => {
  expect(world.lastError?.status).toBe(400);
  expect(world.lastError?.message).toMatch(/name/i);
});

Then("I am told that the family was not found", async ({ world }) => {
  expect(world.lastError?.status).toBe(404);
  expect(world.lastError?.message).toBe("The requested resource was not found");
});
