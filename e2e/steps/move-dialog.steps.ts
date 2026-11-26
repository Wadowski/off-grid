// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { createFolderAs, listItemsAs, personalDriveIdAs } from "../support/factories/files.js";
import type { Session } from "../support/factories/instance-admin.js";
import { ownSessionOf } from "../support/own-session.js";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const DIALOG_TIMEOUT_MS = 10_000;
const REVEAL_LIMIT = 20;
const KEYBOARD_TAB_LIMIT = 60;
const KEYBOARD_ARROW_LIMIT = 30;
const MENU_ENTRY_ROWS =
  '[data-testid="file-table-row"], [data-testid="file-row"], [data-testid="file-card"]';
const LOADING_TEXT = "Loading folders...";
const OTHER_OWNER_TEXT = "Other owner";
const CURRENT_LOCATION_TEXT = "Current location";

const openMenuOf = (page: Page): Locator => page.getByRole("menu");

const dialogOf = (page: Page): Locator => page.getByTestId("move-dialog");

const treeOf = (page: Page): Locator => page.getByTestId("move-dialog-tree");

const confirmOf = (page: Page): Locator => page.getByTestId("move-dialog-confirm");

const rowLabeled = (page: Page, name: string): Locator =>
  treeOf(page)
    .locator('li[role="treeitem"] > div')
    .filter({ has: page.getByText(name, { exact: true }) });

const itemOf = (row: Locator): Locator => row.locator("..");

const toggleOf = (row: Locator): Locator => row.locator(":scope > span").first();

const collapsedRows = (page: Page): Locator =>
  treeOf(page).locator(
    'li[role="treeitem"][aria-expanded="false"]:not([aria-disabled="true"]) > div',
  );

const focusedItemOf = (page: Page): Locator => treeOf(page).locator('[role="treeitem"]:focus');

const isFocusedRowNamed = async (page: Page, name: string): Promise<boolean> =>
  (await focusedItemOf(page).locator(":scope > div").getByText(name, { exact: true }).count()) > 0;

const waitForChildrenLoaded = async (item: Locator): Promise<void> => {
  await expect(item).toHaveAttribute("aria-expanded", "true", { timeout: DIALOG_TIMEOUT_MS });
  await expect(item.getByText(LOADING_TEXT, { exact: true })).toHaveCount(0, {
    timeout: DIALOG_TIMEOUT_MS,
  });
};

const expandRow = async (page: Page, row: Locator): Promise<void> => {
  const itemTestId = await itemOf(row).getAttribute("data-testid");
  if (itemTestId === null) {
    throw new Error("The move dialog row has no test id.");
  }
  await toggleOf(row).click();
  await waitForChildrenLoaded(page.getByTestId(itemTestId));
};

const revealRow = async (page: Page, name: string): Promise<Locator> => {
  for (let attempt = 0; attempt < REVEAL_LIMIT; attempt++) {
    const row = rowLabeled(page, name);
    if ((await row.count()) > 0) {
      await expect(row).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
      return row;
    }
    const collapsed = collapsedRows(page).first();
    await expect(collapsed, `a folder above ${name} can be expanded`).toBeVisible({
      timeout: DIALOG_TIMEOUT_MS,
    });
    await expandRow(page, collapsed);
  }
  throw new Error(`The move dialog does not show ${name}.`);
};

const chooseInDialog = async (page: Page, name: string): Promise<void> => {
  const row = await revealRow(page, name);
  await row.click();
};

const expandInDialog = async (page: Page, name: string): Promise<void> => {
  const row = await revealRow(page, name);
  await expandRow(page, row);
};

const actionsTriggerOf = (page: Page, name: string): Locator =>
  page
    .locator(MENU_ENTRY_ROWS)
    .filter({ has: page.getByText(name, { exact: true }) })
    .getByTestId("file-actions-trigger");

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const pressUntilFocused = async (page: Page, target: Locator, key: string, limit: number) => {
  for (let press = 0; press < limit; press++) {
    if (await isFocused(target)) {
      return;
    }
    await page.keyboard.press(key);
  }
  throw new Error("The keyboard could not reach the expected control.");
};

const folderIdNamed = async (
  api: APIRequestContext,
  session: Session,
  driveId: string,
  name: string,
): Promise<string> => {
  const items = await listItemsAs(api, session, { kind: "drive", id: driveId });
  const folder = items.find((item) => item.isFolder && item.name === name);
  if (folder === undefined) {
    throw new Error(`The folder ${name} is not in the container`);
  }
  return folder.id;
};

Given(
  /^Anna has a personal-drive folder "([^"]*)" in the folder "([^"]*)"$/,
  async ({ world }, name: string, parentName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    const parentId = await folderIdNamed(world.api, session, driveId, parentName);
    await createFolderAs(world.api, session, driveId, parentId, name);
  },
);

When(/^Anna opens the actions of the folder "([^"]*)"$/, async ({ page }, name: string) => {
  await actionsTriggerOf(page, name).click();
});

When("Anna chooses Move", async ({ page }) => {
  await openMenuOf(page).getByTestId("file-action-move").click();
});

When("Anna chooses Move in the file details panel", async ({ page }) => {
  await page.getByTestId("file-details-move").click();
});

When("Anna chooses Move with the keyboard", async ({ page }) => {
  const moveItem = openMenuOf(page).getByTestId("file-action-move");
  await pressUntilFocused(page, moveItem, "ArrowDown", KEYBOARD_ARROW_LIMIT);
  await page.keyboard.press("Enter");
});

When(/^Anna chooses the folder "([^"]*)" in the move dialog$/, async ({ page }, name: string) => {
  await chooseInDialog(page, name);
});

When(/^Anna chooses the drive "([^"]*)" in the move dialog$/, async ({ page }, name: string) => {
  await chooseInDialog(page, name);
});

When(
  /^Anna expands the (?:folder|drive) "([^"]*)" in the move dialog$/,
  async ({ page }, name: string) => {
    await expandInDialog(page, name);
  },
);

When(/^Anna confirms the move(?: anyway)?$/, async ({ page }) => {
  await confirmOf(page).click();
});

When("Anna cancels the move dialog", async ({ page }) => {
  await page.getByTestId("move-dialog-cancel").click();
});

When(
  /^Anna moves through the move dialog tree with the arrow keys to "([^"]*)"$/,
  async ({ page }, name: string) => {
    await treeOf(page).locator('[role="treeitem"]').first().focus();
    await page.keyboard.press("ArrowRight");
    await waitForChildrenLoaded(treeOf(page).locator('[role="treeitem"]').first());
    for (let press = 0; press < KEYBOARD_ARROW_LIMIT; press++) {
      if (await isFocusedRowNamed(page, name)) {
        return;
      }
      await page.keyboard.press("ArrowDown");
    }
    throw new Error(`The keyboard could not reach ${name} in the move dialog tree.`);
  },
);

When("Anna selects the tree item with Enter", async ({ page }) => {
  await page.keyboard.press("Enter");
});

When("Anna confirms the move with the keyboard", async ({ page }) => {
  await pressUntilFocused(page, confirmOf(page), "Tab", KEYBOARD_TAB_LIMIT);
  await page.keyboard.press("Enter");
});

Then("the move dialog is open", async ({ page }) => {
  await expect(dialogOf(page)).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});

Then("the move dialog is open on a phone", async ({ page }) => {
  await expect(dialogOf(page)).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});

Then("the move dialog is closed", async ({ page }) => {
  await expect(dialogOf(page)).toHaveCount(0, { timeout: DIALOG_TIMEOUT_MS });
});

Then(/^the move dialog lists the drive "([^"]*)" as a root$/, async ({ page }, name: string) => {
  await expect(rowLabeled(page, name)).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});

Then(/^the move dialog lists the folder "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowLabeled(page, name)).toBeVisible({ timeout: DIALOG_TIMEOUT_MS });
});

Then(/^the move dialog does not list the folder "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowLabeled(page, name)).toHaveCount(0);
});

Then(/^the move dialog does not list "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(rowLabeled(page, name)).toHaveCount(0);
});

Then(/^the folder "([^"]*)" in the move dialog is disabled$/, async ({ page }, name: string) => {
  await expect(itemOf(rowLabeled(page, name))).toHaveAttribute("aria-disabled", "true", {
    timeout: DIALOG_TIMEOUT_MS,
  });
});

Then(/^the move dialog captions "([^"]*)" as "Other owner"$/, async ({ page }, name: string) => {
  await expect(rowLabeled(page, name).getByText(OTHER_OWNER_TEXT, { exact: true })).toBeVisible({
    timeout: DIALOG_TIMEOUT_MS,
  });
});

Then(
  /^the move dialog marks the folder "([^"]*)" as the current location$/,
  async ({ page }, name: string) => {
    const row = await revealRow(page, name);
    await expect(row.getByText(CURRENT_LOCATION_TEXT, { exact: true })).toBeVisible({
      timeout: DIALOG_TIMEOUT_MS,
    });
  },
);

Then("the move dialog Move button is disabled", async ({ page }) => {
  await expect(confirmOf(page)).toBeDisabled({ timeout: DIALOG_TIMEOUT_MS });
});

Then("the move dialog Move button is enabled", async ({ page }) => {
  await expect(confirmOf(page)).toBeEnabled({ timeout: DIALOG_TIMEOUT_MS });
});

Then(/^the move dialog says "([^"]*)"$/, async ({ page }, text: string) => {
  await expect(dialogOf(page).getByText(text, { exact: true })).toBeVisible({
    timeout: DIALOG_TIMEOUT_MS,
  });
});

Then(/^the move dialog does not say "([^"]*)"$/, async ({ page }, text: string) => {
  await expect(dialogOf(page).getByText(text, { exact: true })).toHaveCount(0);
});

Then(/^the move dialog shows the error "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(page.getByTestId("move-dialog-error")).toHaveText(message, {
    timeout: DIALOG_TIMEOUT_MS,
  });
});

Then(/^Anna is told "([^"]*)" was moved to "([^"]*)"$/, async ({ page }, name, target) => {
  await expect(page.getByTestId("files-move-notice")).toContainText(
    `"${name}" was moved to "${target}".`,
    { timeout: DIALOG_TIMEOUT_MS },
  );
});

Then(
  /^Anna is told "([^"]*)" was copied to "([^"]*)" and removed here$/,
  async ({ page }, name: string, target: string) => {
    await expect(page.getByTestId("files-move-notice")).toContainText(
      `"${name}" was copied to "${target}" and removed here.`,
      { timeout: DIALOG_TIMEOUT_MS },
    );
  },
);
