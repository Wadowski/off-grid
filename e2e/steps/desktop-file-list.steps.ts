// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { webBaseUrl } from "../support/stack.js";
import { createFolderAs, findFolderFrom, personalDriveIdAs } from "../support/factories/files.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;
const KEYBOARD_TAB_LIMIT = 60;
const QUOTED_NAME = /"([^"]*)"/g;

const ownSessionOf = async (world: ScenarioWorld): Promise<Session> => {
  if (world.ownAccount === undefined) {
    throw new Error("No web account has been signed in for this scenario.");
  }
  const account = world.ownAccount;
  const signedIn = await signInWith(world.api, account.email, account.password);
  if (signedIn.session === undefined) {
    throw new Error(`${account.displayName} cannot sign in through the API.`);
  }
  return signedIn.session;
};

const namesIn = (listing: string): string[] =>
  [...listing.matchAll(QUOTED_NAME)].map((match) => match[1] ?? "");

const tableRows = (page: Page) => page.getByTestId("file-table-row");

const rowNamed = (page: Page, name: string): Locator =>
  tableRows(page).filter({
    has: page.getByTestId("file-table-name").getByText(name, { exact: true }),
  });

const rowActivatorNamed = (page: Page, name: string): Locator =>
  rowNamed(page, name).getByTestId("file-table-activate");

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const tabToRowActivator = async (page: Page, name: string): Promise<void> => {
  const activator = rowActivatorNamed(page, name);
  for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
    if (await isFocused(activator)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`The keyboard could not reach the table row ${name}.`);
};

const waitForFolderContents = (page: Page): Promise<void> =>
  expect(page.getByTestId("files-folder-contents")).toBeVisible();

Given(
  /^Anna has a personal-drive folder "([^"]*)" holding (\d+) entries$/,
  async ({ world }, name: string, count: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    await createFolderAs(world.api, session, driveId, null, name);
    const folderId = await findFolderFrom(
      world.api,
      session,
      [{ kind: "drive", id: driveId }],
      name,
    );
    for (let index = 1; index <= Number(count); index++) {
      await createFolderAs(
        world.api,
        session,
        driveId,
        folderId,
        `Entry ${String(index).padStart(2, "0")}`,
      );
    }
  },
);

When("Anna opens the files page on a desktop screen", async ({ page, world }) => {
  const driveId = await personalDriveIdAs(world.api, await ownSessionOf(world));
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
  await page.goto(`${webBaseUrl()}/files/${driveId}`);
  await waitForFolderContents(page);
});

When(/^Anna opens the folder "([^"]*)" from the table$/, async ({ page }, name: string) => {
  await rowActivatorNamed(page, name).click();
});

When(
  /^Anna reaches the table row "([^"]*)" with the keyboard and presses Enter$/,
  async ({ page }, name: string) => {
    await tabToRowActivator(page, name);
    await page.keyboard.press("Enter");
  },
);

When(
  /^Anna selects the table row "([^"]*)" with the keyboard and presses Space$/,
  async ({ page }, name: string) => {
    await tabToRowActivator(page, name);
    await page.keyboard.press("Space");
  },
);

When(/^Anna selects the table row "([^"]*)"$/, async ({ page }, name: string) => {
  await rowActivatorNamed(page, name).click();
});

When("Anna loads more entries", async ({ page }) => {
  await page.getByTestId("files-load-more").click();
});

Then(/^the Files page heading reads "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(
    page.getByTestId("files-page").getByRole("heading", { level: 1, name, exact: true }),
  ).toBeVisible();
});

Then(/^the table has the columns (.+)$/, async ({ page }, listing: string) => {
  const table = page.getByRole("table", { name: "Folder contents" });
  await expect(table.getByRole("columnheader")).toHaveText(namesIn(listing));
});

Then(
  /^the table row "([^"]*)" shows the type "([^"]*)"$/,
  async ({ page }, name: string, type: string) => {
    await expect(rowNamed(page, name).getByRole("cell").nth(3)).toHaveText(type);
  },
);

Then(/^the table lists the (?:folder|file) "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toBeVisible();
});

Then(/^the table rows read (.+) in that order$/, async ({ page }, listing: string) => {
  await expect(page.getByTestId("file-table-name")).toHaveText(namesIn(listing));
});

Then(/^the table row "([^"]*)" is selected$/, async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toHaveAttribute("data-selected", "true");
});

Then(/^the table row "([^"]*)" is not selected$/, async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toHaveAttribute("data-selected", "false");
});

Then(/^the table shows (\d+) rows$/, async ({ page }, count: string) => {
  await expect(tableRows(page)).toHaveCount(Number(count));
});

Then("the load more control is not shown", async ({ page }) => {
  await expect(page.getByTestId("files-load-more")).toHaveCount(0);
});
