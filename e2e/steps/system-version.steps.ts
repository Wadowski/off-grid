// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then } = createBdd(test);

const SETTINGS_PATH = "/settings";
const VERSION_PATH = "/api/system/version";
const ALLOWED_KEYS = ["version", "commit"];

When("I open my settings", async ({ page }) => {
  await page.goto(`${webBaseUrl()}${SETTINGS_PATH}`);
});

Then("I see the version the server is running", async ({ page, world }) => {
  const response = await world.api.get(VERSION_PATH);
  expect(response.status()).toBe(200);
  const { version } = (await response.json()) as { version: string };
  await expect(page.getByTestId("settings-version")).toHaveText(`Offgrid version ${version}`);
});

When("the running version of the server is checked without signing in", async ({ world }) => {
  world.versionResponse = await world.api.get(VERSION_PATH);
});

Then("the server reports a version and no personal data", async ({ world }) => {
  expect(world.versionResponse?.status()).toBe(200);
  const body = (await world.versionResponse?.json()) as Record<string, unknown>;
  const keys = Object.keys(body);
  expect(keys).toEqual(expect.arrayContaining(["version"]));
  expect(
    keys.filter((key) => !ALLOWED_KEYS.includes(key)),
    `keys outside ${ALLOWED_KEYS.join(", ")}: ${keys.join(", ")}`,
  ).toEqual([]);
  expect(typeof body.version).toBe("string");
});
