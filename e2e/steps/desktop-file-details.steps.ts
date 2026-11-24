// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { ownSessionOf } from "../support/own-session.js";
import { createFamilyAs, uploadFileAs, waitForDrives } from "../support/factories/files.js";
import { webBaseUrl } from "../support/stack.js";
import { rowActivatorNamed } from "../support/files-table.js";

const { Given, When, Then } = createBdd(test);

const uploadFamilyFile = async (
  world: ScenarioWorld,
  familyName: string,
  name: string,
  content: string,
) => {
  const session = await ownSessionOf(world);
  const family = await createFamilyAs(world.api, session, familyName);
  world.families.push(family);
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  const driveId = drives.find((drive) => drive.familyId === family.id)?.id ?? "";
  const response = await uploadFileAs(world.api, session, driveId, {
    name,
    parentId: null,
    body: content,
  });
  if (response.status !== 201) {
    throw new Error(`The file ${name} could not be uploaded (${response.status}).`);
  }
};

Given(
  /^Anna has a family "([^"]*)" with a file "([^"]*)" with the content "([^"]*)"$/,
  async ({ world }, familyName: string, name: string, content: string) => {
    await uploadFamilyFile(world, familyName, name, content);
  },
);

When(
  /^Anna opens the family drive "([^"]*)" on a desktop screen$/,
  async ({ page, world }, familyName: string) => {
    const session = await ownSessionOf(world);
    const family = [...world.families].reverse().find((listed) => listed.name === familyName);
    if (family === undefined) {
      throw new Error(`The family ${familyName} has not been created in this scenario.`);
    }
    const drives = await waitForDrives(world.api, session, (listed) =>
      listed.some((drive) => drive.familyId === family.id),
    );
    const driveId = drives.find((drive) => drive.familyId === family.id)?.id ?? "";
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await page.goto(`${webBaseUrl()}/files/${driveId}`);
    await expect(page.getByTestId("files-folder-contents")).toBeVisible();
  },
);

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;
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

Then("the file details panel is on the right of the table", async ({ page }) => {
  const list = await page.getByTestId("files-file-list").boundingBox();
  const panel = await page.getByTestId(DETAILS_TESTID).boundingBox();
  expect(panel?.x ?? 0).toBeGreaterThanOrEqual((list?.x ?? 0) + (list?.width ?? 0) - 1);
});

Then("the file details panel replaces the drive switcher", async ({ page }) => {
  await expect(page.getByTestId(DETAILS_TESTID)).toBeVisible();
  await expect(page.getByTestId("drive-switcher")).toHaveCount(0);
});

Then("the drive switcher is shown again", async ({ page }) => {
  await expect(page.getByTestId("drive-switcher")).toBeVisible();
});

Then("the table fits its width without a horizontal scroll", async ({ page }) => {
  const list = await page.getByTestId("files-file-list").boundingBox();
  const table = await page.getByRole("table", { name: "Folder contents" }).boundingBox();
  expect(table?.width ?? 0).toBeLessThanOrEqual((list?.width ?? 0) + 1);
});

Then("the file details panel shows no version or link sections", async ({ page }) => {
  const panel = page.getByTestId(DETAILS_TESTID);
  await expect(panel.getByRole("link")).toHaveCount(0);
  await expect(panel.getByText(/version/i)).toHaveCount(0);
});

Then(/^the table row "([^"]*)" has the keyboard focus$/, async ({ page }, name: string) => {
  await expect(rowActivatorNamed(page, name)).toBeFocused();
});
