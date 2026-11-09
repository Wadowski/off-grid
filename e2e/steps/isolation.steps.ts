// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signInWith } from "../support/factories/instance-admin.js";
import { expect, test } from "../support/fixtures.js";

const { Given, Then } = createBdd(test);

Given("a family is created through the API", async ({ world }) => {
  const email = uniqueEmail("isolation");
  const registration = await registerAccount(world.api, { email, displayName: "Isolation" });
  expect(registration.status).toBe(201);
  const { session } = await signInWith(world.api, email, STRONG_PASSWORD);
  expect(session, "the owner cannot sign in").toBeDefined();
  const response = await world.api.post("/api/families", {
    headers: { authorization: `Bearer ${session?.accessToken ?? ""}` },
    data: { name: "Isolated family" },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(201);
  world.families.push((await response.json()) as { id: string; name: string });
});

Then("the two families have different identifiers", async ({ world }) => {
  const [first, second] = world.families;
  expect(first, "first family was not created").toBeDefined();
  expect(second, "second family was not created").toBeDefined();
  expect(first?.id).not.toBe(second?.id);
});
