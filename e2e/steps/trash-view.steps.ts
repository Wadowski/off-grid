// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { familyDriveIdNamed } from "../support/family-drive-id-named.js";
import {
  createFolderAs,
  findFolderFrom,
  getAs,
  personalDriveIdAs,
  postAs,
  uploadFileAs,
} from "../support/factories/files.js";
import type { Session } from "../support/factories/instance-admin.js";
import { ownSessionOf } from "../support/own-session.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const DESKTOP_WIDTH = 1280;
const DESKTOP_HEIGHT = 800;
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;

const trashList = (page: Page): Locator => page.getByTestId("trash-list");

const trashEntryNamed = (page: Page, name: string): Locator =>
  trashList(page).getByText(name, { exact: true });

const restoreButtonNamed = (page: Page, name: string): Locator =>
  page.getByRole("button", { name: `Restore ${name}`, exact: true });

const deletedDateOf = (page: Page, name: string): Locator =>
  trashList(page)
    .locator("[data-testid='file-table-row'], [data-testid='file-row']")
    .filter({ hasText: name })
    .getByTestId("file-modified");

const trashedIdNamed = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  name: string,
): Promise<string> => {
  const response = await getAs(world.api, session, `/api/drives/${driveId}/trash`);
  const items = (response.body as { items: { id: string; name: string }[] }).items;
  const match = items.find((item) => item.name === name);
  if (match === undefined) {
    throw new Error(`The trashed item ${name} is not listed.`);
  }
  return match.id;
};

const trashAs = async (world: ScenarioWorld, session: Session, id: string): Promise<void> => {
  const response = await postAs(world.api, session, `/api/files/${id}/trash`, undefined);
  if (response.status !== 200) {
    throw new Error(`The item could not be moved to the trash (${response.status}).`);
  }
};

const uploadAndTrash = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  parentId: string | null,
  name: string,
): Promise<void> => {
  const response = await uploadFileAs(world.api, session, driveId, {
    name,
    parentId,
    body: `Contents of ${name}`,
  });
  if (response.status !== 201) {
    throw new Error(`The file ${name} could not be uploaded (${response.status}).`);
  }
  await trashAs(world, session, (response.body as { id: string }).id);
};

const createTrashableFolder = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  folderName: string,
): Promise<string> => {
  await createFolderAs(world.api, session, driveId, null, folderName);
  return findFolderFrom(world.api, session, [{ kind: "drive", id: driveId }], folderName);
};

const openTrashAt = async (page: Page, driveId: string): Promise<void> => {
  await page.goto(`${webBaseUrl()}/files/${driveId}/trash`);
  await expect(page.getByTestId("trash-page")).toBeVisible();
};

Given(
  /^Anna has a personal-drive file "([^"]*)" in the trash$/,
  async ({ world }, fileName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    await uploadAndTrash(world, session, driveId, null, fileName);
  },
);

Given(
  /^Anna has a trashed personal-drive folder "([^"]*)" holding a file "([^"]*)"$/,
  async ({ world }, folderName: string, fileName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    const folderId = await createTrashableFolder(world, session, driveId, folderName);
    const response = await uploadFileAs(world.api, session, driveId, {
      name: fileName,
      parentId: folderId,
      body: `Contents of ${fileName}`,
    });
    expect(response.status, `${fileName} is uploaded`).toBe(201);
    await trashAs(world, session, folderId);
  },
);

Given(
  /^Anna has a trashed personal-drive folder "([^"]*)" holding a trashed file "([^"]*)"$/,
  async ({ world }, folderName: string, fileName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    const folderId = await createTrashableFolder(world, session, driveId, folderName);
    await uploadAndTrash(world, session, driveId, folderId, fileName);
    await trashAs(world, session, folderId);
  },
);

Given(
  /^Anna has a file "([^"]*)" in the folder "([^"]*)" in the trash$/,
  async ({ world }, fileName: string, folderName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdAs(world.api, session);
    const folderId = await findFolderFrom(
      world.api,
      session,
      [{ kind: "drive", id: driveId }],
      folderName,
    );
    await uploadAndTrash(world, session, driveId, folderId, fileName);
  },
);

Given(
  /^Anna has a file "([^"]*)" in the trash of the family drive "([^"]*)"$/,
  async ({ world }, fileName: string, familyName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await familyDriveIdNamed(world, session, familyName);
    await uploadAndTrash(world, session, driveId, null, fileName);
  },
);

When("Anna opens the trash of her personal drive on a desktop screen", async ({ page, world }) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdAs(world.api, session);
  await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
  await openTrashAt(page, driveId);
});

When(
  /^Anna opens the trash of the family drive "([^"]*)" on a desktop screen$/,
  async ({ page, world }, familyName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await familyDriveIdNamed(world, session, familyName);
    await page.setViewportSize({ width: DESKTOP_WIDTH, height: DESKTOP_HEIGHT });
    await openTrashAt(page, driveId);
  },
);

When("Anna opens the trash from the phone top row", async ({ page }) => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.getByTestId("files-top-bar-trash").click();
  await expect(page.getByTestId("trash-page")).toBeVisible();
});

When(/^Anna restores "([^"]*)" from the trash view$/, async ({ page }, name: string) => {
  await restoreButtonNamed(page, name).click();
});

When("Anna follows the link in the trash view notice", async ({ page }) => {
  await page.getByTestId("trash-restored-link").click();
});

When(/^the file "([^"]*)" is restored in another window$/, async ({ world }, name: string) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdAs(world.api, session);
  const id = await trashedIdNamed(world, session, driveId, name);
  const response = await postAs(world.api, session, `/api/files/${id}/restore`, undefined);
  expect(response.status, `${name} is restored elsewhere`).toBe(200);
});

Then(
  /^the trash view lists "([^"]*)" with a deleted date and a Restore button$/,
  async ({ page }, name: string) => {
    await expect(trashEntryNamed(page, name)).toBeVisible();
    await expect(deletedDateOf(page, name)).not.toBeEmpty();
    await expect(restoreButtonNamed(page, name)).toBeVisible();
  },
);

Then(/^the trash view lists "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(trashEntryNamed(page, name)).toBeVisible();
});

Then(/^the trash view does not list "([^"]*)"$/, async ({ page }, name: string) => {
  await expect(trashEntryNamed(page, name)).toHaveCount(0);
});

Then(/^the trash view notice says "([^"]*)" was restored$/, async ({ page }, name: string) => {
  await expect(page.getByTestId("trash-restored-notice")).toContainText(`"${name}" was restored.`);
});

Then("the trash view says the trash is empty", async ({ page }) => {
  await expect(page.getByTestId("trash-empty")).toContainText("Trash is empty");
});

Then(/^the trash view shows the error "([^"]*)"$/, async ({ page }, message: string) => {
  await expect(page.getByTestId("trash-error")).toHaveText(message);
});

Then("the sidebar Trash entry is the current page", async ({ page }) => {
  await expect(page.getByTestId("drive-switcher-trash")).toHaveAttribute("aria-current", "page");
});
