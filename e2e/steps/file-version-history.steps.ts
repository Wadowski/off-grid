// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { personalDriveIdAs, uploadFileAs, uploadVersionAs } from "../support/factories/files.js";
import { ownSessionOf } from "../support/own-session.js";
import { familyFileIdOf, sessionOf } from "./file-versions.steps.js";

const { Given, When, Then } = createBdd(test);

const SECTION_TESTID = "file-versions-section";
const DETAILS_PANEL_TESTID = "file-details-panel";
const SIZE_TESTID = "file-details-property-size";
const DELETE_DIALOG_TESTID = "delete-version-confirm";
const DELETE_CONFIRM_TESTID = "delete-version-confirm-action";
const DELETE_CANCEL_TESTID = "delete-version-cancel";
const SIZE_PATTERN = /\d+(?:[.,]\d+)? ?(?:B|KB|MB|GB|TB)/;

const versionsSection = (page: Page): Locator => page.getByTestId(SECTION_TESTID);

const versionRows = (page: Page): Locator => versionsSection(page).getByTestId("file-version-row");

const versionRowIn = (page: Page, number: number): Locator =>
  versionRows(page).and(page.locator(`[data-version="${number}"]`));

const uploadPersonalFileWithContent = async (
  world: ScenarioWorld,
  name: string,
  content: string,
) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdAs(world.api, session);
  const response = await uploadFileAs(world.api, session, driveId, {
    name,
    parentId: null,
    body: content,
  });
  expect(response.status, `Anna has the file ${name}`).toBe(201);
};

Given(
  /^Anna has a personal-drive file "([^"]*)" with the content "([^"]*)"$/,
  async ({ world }, name: string, content: string) => {
    await uploadPersonalFileWithContent(world, name, content);
  },
);

Given(
  /^Anna uploads a new version of "([^"]*)" in the family drive with the content "([^"]*)"$/,
  async ({ world }, name: string, content: string) => {
    const session = await sessionOf(world, "Anna");
    const fileId = await familyFileIdOf(world, "Home", name);
    const response = await uploadVersionAs(world.api, session, fileId, content);
    expect(response.status, `Anna uploads a new version of ${name}`).toBe(201);
  },
);

When(
  /^Anna uploads a new version of "([^"]*)" from the versions section with the content "([^"]*)"$/,
  async ({ page }, name: string, content: string) => {
    await versionsSection(page)
      .locator('input[type="file"]')
      .setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from(content) });
  },
);

When(
  /^Anna restores version (\d+) from the (?:phone )?versions section$/,
  async ({ page }, number: string) => {
    await versionRowIn(page, Number(number)).getByTestId("file-version-restore").click();
  },
);

When(
  /^Anna deletes version (\d+) from the versions section and confirms$/,
  async ({ page }, number: string) => {
    await versionRowIn(page, Number(number)).getByTestId("file-version-delete").click();
    await page.getByTestId(DELETE_CONFIRM_TESTID).click();
  },
);

When(
  /^Anna deletes version (\d+) from the versions section and cancels$/,
  async ({ page }, number: string) => {
    await versionRowIn(page, Number(number)).getByTestId("file-version-delete").click();
    await page.getByTestId(DELETE_CANCEL_TESTID).click();
  },
);

When(
  /^Anna opens the delete confirmation for version (\d+) from the versions section$/,
  async ({ page }, number: string) => {
    await versionRowIn(page, Number(number)).getByTestId("file-version-delete").click();
  },
);

When("Anna presses Escape in the delete confirmation", async ({ page }) => {
  await page.getByTestId(DELETE_CANCEL_TESTID).focus();
  await page.keyboard.press("Escape");
});

When(
  /^Anna downloads version (\d+) from the versions section$/,
  async ({ page, world }, number: string) => {
    const download = page.waitForEvent("download");
    await versionRowIn(page, Number(number)).getByTestId("file-version-download").click();
    const saved = await download;
    world.browserDownload = {
      name: saved.suggestedFilename(),
      content: await readFile((await saved.path()) ?? "", "utf8"),
    };
  },
);

Then(
  /^the (?:phone )?versions section lists (\d+) versions? with version (\d+) first$/,
  async ({ page }, count: string, newest: string) => {
    await expect(versionRows(page)).toHaveCount(Number(count));
    await expect(versionRows(page).first()).toHaveAttribute("data-version", String(newest));
  },
);

Then(/^the version (\d+) row is marked as current$/, async ({ page }, number: string) => {
  await expect(
    versionRowIn(page, Number(number)).getByTestId("file-version-current"),
  ).toBeVisible();
});

Then(
  /^the version (\d+) row shows the author "([^"]*)" and a size$/,
  async ({ page }, number: string, author: string) => {
    const row = versionRowIn(page, Number(number));
    await expect(row).toContainText(author);
    await expect(row).toContainText(SIZE_PATTERN);
  },
);

Then(/^the version (\d+) row offers no delete action$/, async ({ page }, number: string) => {
  await expect(versionRowIn(page, Number(number)).getByTestId("file-version-delete")).toHaveCount(
    0,
  );
});

Then(
  /^the file details panel shows the size of "([^"]*)" as (\d+) bytes$/,
  async ({ page }, _name: string, bytes: string) => {
    await expect(page.getByTestId(DETAILS_PANEL_TESTID).getByTestId(SIZE_TESTID)).toContainText(
      `${bytes} B`,
    );
  },
);

Then("the delete confirmation is not shown", async ({ page }) => {
  await expect(page.getByTestId(DELETE_DIALOG_TESTID)).toHaveCount(0);
});

Then("the file details panel is shown", async ({ page }) => {
  await expect(page.getByTestId(DETAILS_PANEL_TESTID)).toBeVisible();
});

Then(
  /^the download is the content "([^"]*)" named "([^"]*)"$/,
  ({ world }, content: string, name: string) => {
    expect(world.browserDownload, "a version was downloaded").toBeDefined();
    expect(world.browserDownload?.content, "the bytes are the version's content").toBe(content);
    expect(world.browserDownload?.name, "the download is named after the file").toBe(name);
  },
);
