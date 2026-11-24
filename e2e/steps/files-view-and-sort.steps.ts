// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  createFolderAs,
  findFolderFrom,
  personalDriveIdAs,
  uploadFileAs,
} from "../support/factories/files.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const KEYBOARD_TAB_LIMIT = 60;
const ARCHIVE_SIZE_STEP_BYTES = 100;
const QUOTED_NAME = /"([^"]*)"/g;
const SORT_FIELD_BY_LABEL: Readonly<Record<string, string>> = {
  Name: "name",
  Modified: "modified",
  Size: "size",
};

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

const gridCards = (page: Page) => page.getByTestId("files-file-grid").getByTestId("file-card");

const gridCardNamed = (page: Page, name: string): Locator =>
  gridCards(page).filter({ has: page.getByTestId("file-name").getByText(name, { exact: true }) });

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const tabTo = async (page: Page, target: Locator, description: string): Promise<void> => {
  for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
    if (await isFocused(target)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`The keyboard could not reach the ${description}.`);
};

const uploadSizedFile = async (
  api: APIRequestContext,
  session: Session,
  driveId: string,
  upload: { readonly name: string; readonly sizeBytes: number; readonly parentId: string | null },
): Promise<void> => {
  const response = await uploadFileAs(api, session, driveId, {
    name: upload.name,
    parentId: upload.parentId,
    body: "x".repeat(upload.sizeBytes),
  });
  if (response.status !== 201) {
    throw new Error(`The file ${upload.name} could not be uploaded (${response.status}).`);
  }
};

Given(
  /^Anna has a personal-drive file "([^"]*)" of (\d+) bytes$/,
  async ({ world }, name: string, sizeBytes: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    await uploadSizedFile(world.api, session, driveId, {
      name,
      sizeBytes: Number(sizeBytes),
      parentId: null,
    });
  },
);

Given(
  /^Anna has a personal-drive folder "([^"]*)" holding (\d+) files of increasing size$/,
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
      await uploadSizedFile(world.api, session, driveId, {
        name: `File ${String(index).padStart(2, "0")}`,
        sizeBytes: index * ARCHIVE_SIZE_STEP_BYTES,
        parentId: folderId,
      });
    }
  },
);

Given("the browser blocks its local storage", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis, "localStorage", {
      get: () => {
        throw new Error("Storage is blocked");
      },
    });
  });
});

When("Anna switches the view to grid", async ({ page }) => {
  await page.getByTestId("segmented-option-grid").click();
});

When("Anna switches the view to list", async ({ page }) => {
  await page.getByTestId("segmented-option-list").click();
});

When(/^Anna sorts the entries by (size|modified date)$/, async ({ page }, field: string) => {
  const value = field === "size" ? "size" : "modified";
  await page.getByTestId("files-sort-select").selectOption(value);
});

When(/^Anna reverses the sort direction$/, async ({ page }) => {
  await page.getByTestId("files-sort-direction").click();
});

When(/^Anna opens the folder "([^"]*)" from the grid$/, async ({ page }, name: string) => {
  await gridCardNamed(page, name).getByTestId("file-card-activate").click();
});

When("Anna reaches the grid view option with the keyboard and presses Space", async ({ page }) => {
  const option = page.getByTestId("segmented-option-grid");
  await tabTo(page, option, "grid view option");
  await page.keyboard.press("Space");
});

When(
  "Anna reaches the sort direction control with the keyboard and presses Enter",
  async ({ page }) => {
    const control = page.getByTestId("files-sort-direction");
    await tabTo(page, control, "sort direction control");
    await page.keyboard.press("Enter");
  },
);

Then(/^the grid shows the cards (.+)$/, async ({ page }, listing: string) => {
  await expect(gridCards(page).getByTestId("file-name")).toHaveText(namesIn(listing));
});

Then(/^the grid shows the card "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(gridCardNamed(page, name)).toBeVisible();
});

Then(/^the grid card "([^"]*)" is selected$/, async ({ page }, name: string) => {
  await expect(gridCardNamed(page, name)).toHaveAttribute("data-selected", "true");
});

Then(/^the grid card "([^"]*)" is not selected$/, async ({ page }, name: string) => {
  await expect(gridCardNamed(page, name)).toHaveAttribute("data-selected", "false");
});

Then(/^the table row "([^"]*)" is shown$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("file-table-name").getByText(name, { exact: true })).toBeVisible();
});

Then(/^the table row "([^"]*)" is the last row$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("file-table-name").last()).toHaveText(name);
});

Then(/^the sort control shows "([^"]*)"$/, async ({ page }, label: string) => {
  await expect(page.getByTestId("files-sort-select")).toHaveValue(
    SORT_FIELD_BY_LABEL[label] ?? label,
  );
});

Then(/^the sort direction reads "([^"]*)"$/, async ({ page }, direction: string) => {
  const value = direction === "descending" ? "desc" : "asc";
  await expect(page.getByTestId("files-sort-direction")).toHaveAttribute("data-direction", value);
});
