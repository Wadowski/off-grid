// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  findItemAcrossDrives,
  listItemsAs,
  personalDriveIdAs,
  postAs,
} from "../support/factories/files.js";
import { ownSessionOf } from "../support/own-session.js";
import { test } from "../support/fixtures.js";
import { rowNamed } from "../support/files-table.js";

const { When, Then } = createBdd(test);

const KEYBOARD_TAB_LIMIT = 60;
const MENU_ENTRY_ROWS =
  '[data-testid="file-table-row"], [data-testid="file-row"], [data-testid="file-card"]';
const MENU_ENTRY_NAMES = /"([^"]*)"/g;

const namesIn = (listing: string): string[] =>
  [...listing.matchAll(MENU_ENTRY_NAMES)].map((match) => match[1] ?? "");

const entryNamed = (page: Page, name: string): Locator =>
  page.locator(MENU_ENTRY_ROWS).filter({ has: page.getByText(name, { exact: true }) });

const actionsTriggerOf = (page: Page, name: string): Locator =>
  entryNamed(page, name).getByTestId("file-actions-trigger");

const openMenuOf = (page: Page): Locator => page.getByRole("menu");

const deleteDialog = (page: Page): Locator => page.getByTestId("delete-entry-dialog");

const gridCardNamed = (page: Page, name: string): Locator =>
  page
    .getByTestId("files-file-grid")
    .getByTestId("file-card")
    .filter({ has: page.getByTestId("file-name").getByText(name, { exact: true }) });

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const tabToActionsTrigger = async (page: Page, name: string): Promise<void> => {
  const trigger = actionsTriggerOf(page, name);
  for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
    if (await isFocused(trigger)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`The keyboard could not reach the actions of ${name}.`);
};

const chooseDeleteFromMenuOf = async (page: Page, name: string): Promise<void> => {
  await actionsTriggerOf(page, name).click();
  await openMenuOf(page).getByTestId("file-action-delete").click();
};

When(/^Anna opens the actions of the file "([^"]*)"$/, async ({ page }, name: string) => {
  await actionsTriggerOf(page, name).click();
});

When(
  /^Anna opens the actions of the file "([^"]*)" with the keyboard$/,
  async ({ page }, name: string) => {
    await tabToActionsTrigger(page, name);
    await page.keyboard.press("Enter");
  },
);

When("Anna moves through the actions menu with the arrow keys", async ({ page }) => {
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
});

When("Anna presses Escape", async ({ page }) => {
  await page.keyboard.press("Escape");
});

When(
  /^Anna deletes the (?:file|folder) "([^"]*)" from its actions menu$/,
  async ({ page }, name: string) => {
    await chooseDeleteFromMenuOf(page, name);
  },
);

When("Anna confirms moving it to the trash", async ({ page }) => {
  await page.getByTestId("delete-entry-confirm").click();
});

When("Anna cancels the confirmation", async ({ page }) => {
  await page.getByTestId("delete-entry-cancel").click();
});

When(/^the file "([^"]*)" is moved to the trash elsewhere$/, async ({ world }, name: string) => {
  const session = await ownSessionOf(world);
  const item = await findItemAcrossDrives(world.api, session, name);
  const response = await postAs(world.api, session, `/api/files/${item.id}/trash`, undefined);
  expect(response.status, "the file is moved to the trash elsewhere").toBe(200);
});

Then(/^the actions menu lists (.+)$/, async ({ page }, listing: string) => {
  await expect(openMenuOf(page).getByRole("menuitem")).toHaveText(namesIn(listing));
});

Then(/^the actions menu does not list (.+)$/, async ({ page }, listing: string) => {
  for (const label of namesIn(listing)) {
    await expect(openMenuOf(page).getByRole("menuitem", { name: label })).toHaveCount(0);
  }
});

Then(/^the confirmation names the file "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(deleteDialog(page)).toContainText(name);
});

Then(
  /^the confirmation says the folder "([^"]*)" and everything in it moves to the trash$/,
  async ({ page }, name: string) => {
    await expect(deleteDialog(page)).toContainText(
      `Move the folder "${name}" and everything in it`,
    );
  },
);

Then("the confirmation is still open", async ({ page }) => {
  await expect(deleteDialog(page)).toBeVisible();
});

Then(/^the confirmation shows the error "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(page.getByTestId("delete-entry-error")).toHaveText(message);
});

Then(/^the table no longer lists "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toHaveCount(0);
});

Then(/^the table still lists "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowNamed(page, name)).toBeVisible();
});

Then(/^Anna is told "([^"]*)" was moved to the trash$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("files-trash-notice")).toContainText(
    `"${name}" was moved to the trash.`,
  );
});

Then(/^Anna sees "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdAs(world.api, session);
  const names = (await listItemsAs(world.api, session, { kind: "drive", id: driveId })).map(
    (item) => item.name,
  );
  expect(names).toContain(name);
});

Then("the phone list no longer reads {string}", async ({ page }, name: string) => {
  await expect(entryNamed(page, name)).toHaveCount(0);
});

Then(/^the grid no longer shows the card "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(gridCardNamed(page, name)).toHaveCount(0);
});

Then(/^the grid still shows the card "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(gridCardNamed(page, name)).toBeVisible();
});

Then("the actions menu is closed", async ({ page }) => {
  await expect(openMenuOf(page)).toBeHidden();
});

Then(/^the actions button of "([^"]*)" has focus$/, async ({ page }, name: string) => {
  await expect(actionsTriggerOf(page, name)).toBeFocused();
});
