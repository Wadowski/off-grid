// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { webBaseUrl } from "../support/stack.js";
import { postAs, waitForDrives } from "../support/factories/files.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const SIDEBAR_TIMEOUT_MS = 10_000;
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const KEYBOARD_TAB_LIMIT = 60;
const QUOTED_NAME = /"([^"]*)"/g;

const ownAccountOf = (world: ScenarioWorld) => {
  if (world.ownAccount === undefined) {
    throw new Error("No web account has been signed in for this scenario.");
  }
  return world.ownAccount;
};

const ownSessionOf = async (world: ScenarioWorld): Promise<Session> => {
  const account = ownAccountOf(world);
  const signedIn = await signInWith(world.api, account.email, account.password);
  if (signedIn.session === undefined) {
    throw new Error(`${account.displayName} cannot sign in through the API.`);
  }
  return signedIn.session;
};

const familyDriveIdNamed = async (
  world: ScenarioWorld,
  session: Session,
  name: string,
): Promise<string> => {
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId !== null && drive.name === name),
  );
  const drive = drives.find((listed) => listed.familyId !== null && listed.name === name);
  if (drive === undefined) {
    throw new Error(`The family drive ${name} is not listed.`);
  }
  return drive.id;
};

const createTopFolderIn = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  name: string,
): Promise<void> => {
  const response = await postAs(world.api, session, `/api/drives/${driveId}/folders`, {
    parentId: null,
    name,
  });
  if (response.status !== 201) {
    throw new Error(`The folder ${name} could not be created (${response.status}).`);
  }
};

const driveSidebarOf = (page: Page) => page.getByTestId("drive-switcher");

const driveLinkOf = (page: Page, name: string) =>
  driveSidebarOf(page).getByRole("link", { name, exact: true });

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const quotedNamesIn = (listing: string): string[] =>
  [...listing.matchAll(QUOTED_NAME)].map((match) => match[1] ?? "");

Given(
  /^Anna has the folder "([^"]*)" in the family drive "([^"]*)"$/,
  async ({ world }, folderName: string, familyName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await familyDriveIdNamed(world, session, familyName);
    await createTopFolderIn(world, session, driveId, folderName);
  },
);

When(/^Anna opens the Files page in the browser$/, async ({ page }) => {
  await page.goto(`${webBaseUrl()}/files`);
});

When(/^Anna opens the Files page on a phone$/, async ({ page }) => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}/files`);
  await expect(page.getByTestId("files-page")).toBeVisible({ timeout: SIDEBAR_TIMEOUT_MS });
});

When(/^Anna opens the drives page on a phone$/, async ({ page }) => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}/files/drives`);
  await expect(driveSidebarOf(page)).toBeVisible({ timeout: SIDEBAR_TIMEOUT_MS });
});

When("Anna taps the drives link on the phone", async ({ page }) => {
  await page.getByTestId("files-drives-link").click();
});

Then("the drives page is open on the phone", async ({ page }) => {
  await expect(page.getByTestId("files-drives-page")).toBeVisible({ timeout: SIDEBAR_TIMEOUT_MS });
});

When(/^Anna chooses the drive "([^"]*)" in the sidebar$/, async ({ page }, name: string) => {
  await driveLinkOf(page, name).click();
});

When(
  /^Anna reaches the drive "([^"]*)" in the sidebar with the keyboard and presses Enter$/,
  async ({ page }, name: string) => {
    const item = driveLinkOf(page, name);
    for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
      if (await isFocused(item)) {
        await page.keyboard.press("Enter");
        return;
      }
      await page.keyboard.press("Tab");
    }
    throw new Error(`The keyboard could not reach the drive ${name} in the sidebar.`);
  },
);

Then(/^the drive sidebar lists the drives (.+)$/, async ({ page }, listing: string) => {
  const names = quotedNamesIn(listing);
  const rows = driveSidebarOf(page).getByTestId("drive-switcher-row");
  await expect(rows).toHaveCount(names.length, { timeout: SIDEBAR_TIMEOUT_MS });
  for (const [index, name] of names.entries()) {
    await expect(rows.nth(index)).toHaveText(name);
  }
});

Then(/^the drive "([^"]*)" is the active drive in the sidebar$/, async ({ page }, name: string) => {
  await expect(driveLinkOf(page, name)).toHaveAttribute("aria-current", "page", {
    timeout: SIDEBAR_TIMEOUT_MS,
  });
});

Then(/^the folder list shows "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("file-row").filter({ hasText: name }).first()).toBeVisible();
});
