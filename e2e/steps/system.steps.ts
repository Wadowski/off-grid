// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { expect, test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

When("the health of the server is checked", async ({ baseURL, world }) => {
  try {
    world.healthResponse = await world.api.get("/api/health");
  } catch (error) {
    throw new Error(`No server answered at ${baseURL}. Start the server or set BASE_URL.`, {
      cause: error,
    });
  }
});

Then("the server reports that it is up", async ({ world }) => {
  expect(world.healthResponse, "health was not checked").toBeDefined();
  expect(world.healthResponse?.status()).toBe(200);
  expect(await world.healthResponse?.json()).toEqual({ status: "ok" });
});
