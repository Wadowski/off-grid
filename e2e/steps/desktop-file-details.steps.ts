// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";
import { rowActivatorNamed } from "../support/files-table.js";

const { When, Then } = createBdd(test);

const DETAILS_TESTID = "file-details-panel";
const DETAILS_NAME_TESTID = "file-details-panel-name";
const DETAILS_CLOSE_TESTID = "file-details-panel-close";

When("Anna closes the file details panel", async ({ page }) => {
  await page.getByTestId(DETAILS_CLOSE_TESTID).click();
});

When("Anna presses Escape in the file details panel", async ({ page }) => {
  await page.getByTestId(DETAILS_CLOSE_TESTID).focus();
  await page.keyboard.press("Escape");
});

Then(/^the file details panel shows the name "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(page.getByTestId(DETAILS_NAME_TESTID)).toHaveText(name);
});

Then(/^the file details panel shows the type "([^"]*)"$/, async ({ page }, type: string) => {
  await expect(page.getByTestId("file-details-property-type")).toContainText(type);
});

Then(
  "the file details panel shows a size, a modified date and a created date",
  async ({ page }) => {
    await expect(page.getByTestId("file-details-property-size")).toBeVisible();
    await expect(page.getByTestId("file-details-property-modified")).toBeVisible();
    await expect(page.getByTestId("file-details-property-created")).toBeVisible();
  },
);

Then(
  /^the file details panel shows the location "([^"]*)"$/,
  async ({ page }, location: string) => {
    await expect(page.getByTestId("file-details-property-location")).toContainText(location);
  },
);

Then("the file details panel is not shown", async ({ page }) => {
  await expect(page.getByTestId(DETAILS_TESTID)).toHaveCount(0);
});

Then("the table takes the full width", async ({ page }) => {
  const table = page.getByRole("table", { name: "Folder contents" });
  const container = page.getByTestId("files-folder-contents");
  const tableBox = await table.boundingBox();
  const containerBox = await container.boundingBox();
  expect(tableBox?.width ?? 0).toBeGreaterThanOrEqual((containerBox?.width ?? 0) - 1);
});

Then("the file details panel shows no version, download or link sections", async ({ page }) => {
  const panel = page.getByTestId(DETAILS_TESTID);
  await expect(panel.getByRole("button", { name: /download|preview/i })).toHaveCount(0);
  await expect(panel.getByRole("link")).toHaveCount(0);
  await expect(panel.getByText(/version/i)).toHaveCount(0);
});

Then(/^the table row "([^"]*)" has the keyboard focus$/, async ({ page }, name: string) => {
  await expect(rowActivatorNamed(page, name)).toBeFocused();
});
