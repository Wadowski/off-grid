// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { webBaseUrl } from "../support/stack.js";
import {
  createFamilyAs,
  findFolderFrom,
  listItemsAs,
  postAs,
  uploadFileAs,
  waitForDrives,
} from "../support/factories/files.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { signedInPerson } from "../support/factories/notifications.js";
import type { Container } from "../support/factories/types.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const FOLDER_PATH_NAME = "Folder path";
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const LONG_FILE_NAME = `${"Quarterly report for the family archive ".repeat(4)}.txt`;
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

const personalDriveIdOf = async (world: ScenarioWorld, session: Session): Promise<string> => {
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  const drive = drives.find((listed) => listed.familyId === null);
  if (drive === undefined) {
    throw new Error("The personal drive is not listed.");
  }
  return drive.id;
};

const folderIdIn = async (
  world: ScenarioWorld,
  session: Session,
  container: Container,
  name: string,
): Promise<string> => {
  const items = await listItemsAs(world.api, session, container);
  const folder = items.find((item) => item.isFolder && item.name === name);
  if (folder === undefined) {
    throw new Error(`The folder ${name} is not in the container.`);
  }
  return folder.id;
};

const createFolderIn = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  parentId: string | null,
  name: string,
): Promise<void> => {
  const response = await postAs(world.api, session, `/api/drives/${driveId}/folders`, {
    parentId,
    name,
  });
  if (response.status !== 201) {
    throw new Error(`The folder ${name} could not be created (${response.status}).`);
  }
};

const folderPathOf = (page: Page) => page.getByRole("navigation", { name: FOLDER_PATH_NAME });

const isFocused = (locator: Locator): Promise<boolean> =>
  expect(locator)
    .toBeFocused({ timeout: 100 })
    .then(() => true)
    .catch(() => false);

const openFolderInBrowser = async (page: Page, world: ScenarioWorld, name: string) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdOf(world, session);
  const folderId = await findFolderFrom(world.api, session, [{ kind: "drive", id: driveId }], name);
  await page.goto(`${webBaseUrl()}/files/${driveId}/folder/${folderId}`);
};

Given(
  /^Anna has the nested folders "([^"]*)" and "([^"]*)" in her personal drive$/,
  async ({ world }, outerName: string, innerName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdOf(world, session);
    await createFolderIn(world, session, driveId, null, outerName);
    const outerId = await folderIdIn(world, session, { kind: "drive", id: driveId }, outerName);
    await createFolderIn(world, session, driveId, outerId, innerName);
  },
);

When(/^Anna opens the folder "([^"]*)" in the browser$/, async ({ page, world }, name: string) => {
  await openFolderInBrowser(page, world, name);
});

When("Anna opens a folder link that does not exist in the browser", async ({ page, world }) => {
  const driveId = await personalDriveIdOf(world, await ownSessionOf(world));
  await page.goto(`${webBaseUrl()}/files/${driveId}/folder/${randomUUID()}`);
});

When(/^Anna uses the folder path item "([^"]*)"$/, async ({ page }, name: string) => {
  await folderPathOf(page).getByRole("link", { name, exact: true }).click();
});

When("Anna reloads the page", async ({ page }) => {
  await page.reload();
});

When("Anna goes back in the browser", async ({ page }) => {
  await page.goBack();
});

When("Anna goes forward in the browser", async ({ page }) => {
  await page.goForward();
});

Given(
  /^another family named "([^"]*)" has a folder "([^"]*)" in its family drive$/,
  async ({ world }, familyName: string, folderName: string) => {
    const owner = await signedInPerson(world.api, "Ben");
    const family = await createFamilyAs(world.api, owner.session, familyName);
    const drives = await waitForDrives(world.api, owner.session, (listed) =>
      listed.some((drive) => drive.familyId === family.id),
    );
    const driveId = drives.find((drive) => drive.familyId === family.id)?.id;
    if (driveId === undefined) {
      throw new Error(`The family drive of ${familyName} is not listed.`);
    }
    await createFolderIn(world, owner.session, driveId, null, folderName);
    const folderId = await folderIdIn(
      world,
      owner.session,
      { kind: "drive", id: driveId },
      folderName,
    );
    world.files = {
      drives: world.files?.drives ?? {},
      personalDriveIds: world.files?.personalDriveIds ?? {},
      familyDriveIds: { ...world.files?.familyDriveIds, [familyName]: driveId },
      folderIds: { ...world.files?.folderIds, [folderName]: folderId },
    };
  },
);

When(
  /^Anna opens the folder "([^"]*)" of "([^"]*)" in the browser$/,
  async ({ page, world }, folderName: string, familyName: string) => {
    const driveId = world.files?.familyDriveIds[familyName];
    const folderId = world.files?.folderIds?.[folderName];
    if (driveId === undefined || folderId === undefined) {
      throw new Error(`The folder ${folderName} of ${familyName} was not created.`);
    }
    await page.goto(`${webBaseUrl()}/files/${driveId}/folder/${folderId}`);
  },
);

When(
  /^Anna reaches the folder path item "([^"]*)" with the keyboard and presses Enter$/,
  async ({ page }, name: string) => {
    const item = folderPathOf(page).getByRole("link", { name, exact: true });
    for (let press = 0; press < KEYBOARD_TAB_LIMIT; press++) {
      if (await isFocused(item)) {
        await page.keyboard.press("Enter");
        return;
      }
      await page.keyboard.press("Tab");
    }
    throw new Error(`The keyboard could not reach the folder path item ${name}.`);
  },
);

Then(/^the folder path reads (.+)$/, async ({ page }, listing: string) => {
  const names = [...listing.matchAll(QUOTED_NAME)].map((match) => match[1] ?? "");
  const crumbs = folderPathOf(page).getByRole("listitem");
  await expect(crumbs).toHaveCount(names.length);
  for (const [index, name] of names.entries()) {
    await expect(crumbs.nth(index).locator("a, [aria-current='page']").first()).toHaveText(name);
  }
});

Then(/^"([^"]*)" is the current folder in the folder path$/, async ({ page }, name: string) => {
  await expect(folderPathOf(page).locator("[aria-current='page']")).toHaveText(name);
});

Then("Anna sees the folder not found view", async ({ page }) => {
  await expect(page.getByTestId("folder-not-found")).toBeVisible();
});

const waitForFolderContents = (page: Page): Promise<void> =>
  expect(page.getByTestId("files-folder-contents")).toBeVisible();

const openOnPhone = async (page: Page, path: string): Promise<void> => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
  await waitForFolderContents(page);
};

const personalDriveOf = async (world: ScenarioWorld) => {
  const session = await ownSessionOf(world);
  return { session, driveId: await personalDriveIdOf(world, session) };
};

const uploadPersonalFile = async (
  world: ScenarioWorld,
  name: string,
  folderName: string | null,
): Promise<void> => {
  const { session, driveId } = await personalDriveOf(world);
  const parentId =
    folderName === null
      ? null
      : await folderIdIn(world, session, { kind: "drive", id: driveId }, folderName);
  const response = await uploadFileAs(world.api, session, driveId, {
    name,
    parentId,
    body: "Family archive",
  });
  if (response.status !== 201) {
    throw new Error(`The file ${name} could not be uploaded (${response.status}).`);
  }
};

const phoneListRowsOf = (page: Page) => page.getByTestId("files-list").getByTestId("file-row");

const phoneRowNamed = (page: Page, name: string) => phoneListRowsOf(page).filter({ hasText: name });

Given(/^Anna has a personal-drive folder "([^"]*)"$/, async ({ world }, name: string) => {
  const { session, driveId } = await personalDriveOf(world);
  await createFolderIn(world, session, driveId, null, name);
});

Given(/^Anna has a personal-drive file "([^"]*)"$/, async ({ world }, name: string) => {
  await uploadPersonalFile(world, name, null);
});

Given(
  /^Anna has a personal-drive file "([^"]*)" in the folder "([^"]*)"$/,
  async ({ world }, name: string, folderName: string) => {
    await uploadPersonalFile(world, name, folderName);
  },
);

Given("Anna has a personal-drive file with a very long name", async ({ world }) => {
  await uploadPersonalFile(world, LONG_FILE_NAME, null);
});

When("Anna opens her personal drive on a phone", async ({ page, world }) => {
  const { driveId } = await personalDriveOf(world);
  await openOnPhone(page, `/files/${driveId}`);
});

When(
  /^Anna opens the folder "([^"]*)" in the browser on a phone$/,
  async ({ page, world }, name: string) => {
    await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
    await openFolderInBrowser(page, world, name);
    await waitForFolderContents(page);
  },
);

When(/^Anna taps the folder row "([^"]*)"$/, async ({ page }, name: string) => {
  await phoneRowNamed(page, name).getByTestId("file-row-activate").click();
});

When("Anna taps the Back control", async ({ page }) => {
  await page.getByTestId("files-back-link").click();
});

Then(/^the phone list reads (.+)$/, async ({ page }, listing: string) => {
  const names = [...listing.matchAll(QUOTED_NAME)].map((match) => match[1] ?? "");
  await expect(page.getByTestId("files-list").getByTestId("file-name")).toHaveText(names);
});

Then(
  /^the folder row "([^"]*)" shows "([^"]*)"$/,
  async ({ page }, name: string, count: string) => {
    await expect(phoneRowNamed(page, name).getByTestId("file-item-count")).toHaveText(count);
  },
);

Then("the Back control is not shown", async ({ page }) => {
  await expect(page.getByTestId("files-back-link")).toHaveCount(0);
});

Then("the phone page does not scroll sideways", async ({ page }) => {
  await expect
    .poll(() => page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"))
    .toBe(true);
});
