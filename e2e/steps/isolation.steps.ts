// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { apiClientFor } from "../support/api.js";
import { createFamily } from "../support/factories/family.js";
import { expect, test } from "../support/fixtures.js";

const { Given, Then } = createBdd(test);

Given("a family is created through the API", async ({ baseURL, world }) => {
  world.families.push(await createFamily(apiClientFor(baseURL ?? "")));
});

Then("the two families have different identifiers", async ({ world }) => {
  const [first, second] = world.families;
  expect(first, "first family was not created").toBeDefined();
  expect(second, "second family was not created").toBeDefined();
  expect(first?.id).not.toBe(second?.id);
});
