// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { webBaseUrl } from "../support/stack.js";
import {
  createFamilyAs,
  findFolderFrom,
  joinFamilyAs,
  listItemsAs,
  personalDriveIdAs,
  uploadFileAs,
  uploadVersionAs,
  waitForDrives,
} from "../support/factories/files.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { signedInPerson } from "../support/factories/notifications.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const LOCATION_SEPARATOR = " › ";
const QUOTED_NAME = /"([^"]*)"/g;
const LONG_FILE_NAME = `${"Quarterly report for the family archive ".repeat(4)}.txt`;

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

const personalDriveIdOf = async (world: ScenarioWorld): Promise<string> =>
  personalDriveIdAs(world.api, await ownSessionOf(world));

const familyDriveIdOf = (world: ScenarioWorld, familyName: string): string => {
  const driveId = world.files?.familyDriveIds[familyName];
  if (driveId === undefined) {
    throw new Error(`The family drive of ${familyName} was not created.`);
  }
  return driveId;
};

const fileIdIn = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  name: string,
): Promise<string> => {
  const remembered = world.files?.folderIds?.[name];
  if (remembered !== undefined) {
    return remembered;
  }
  const items = await listItemsAs(world.api, session, { kind: "drive", id: driveId });
  const item = items.find((listed) => listed.name === name);
  if (item === undefined) {
    throw new Error(`The file ${name} is not in the drive.`);
  }
  return item.id;
};

const benFamilyDriveIdOf = async (
  world: ScenarioWorld,
  benSession: Session,
  familyName: string,
): Promise<string> => {
  const familyId = world.families.find((created) => created.name === familyName)?.id;
  const drives = await waitForDrives(world.api, benSession, (listed) =>
    listed.some((drive) => drive.familyId === familyId),
  );
  return drives.find((drive) => drive.familyId === familyId)?.id ?? "";
};

const openDetailsPage = async (page: Page, path: string): Promise<void> => {
  await page.setViewportSize({ width: PHONE_WIDTH, height: PHONE_HEIGHT });
  await page.goto(`${webBaseUrl()}${path}`);
};

const waitForDetails = (page: Page): Promise<void> =>
  expect(page.getByTestId("file-details-ready")).toBeVisible();

const propertyRow = (page: Page, key: string): Locator =>
  page.getByTestId(`file-details-property-${key}`);

const phoneRowNamed = (page: Page, name: string): Locator =>
  page.getByTestId("files-list").getByTestId("file-row").filter({ hasText: name });

const accessRows = (page: Page): Locator => page.getByTestId("file-access-row");

const namesIn = (listing: string): string[] =>
  [...listing.matchAll(QUOTED_NAME)].map((match) => match[1] ?? "");

Given(
  /^Anna is a member of the family "([^"]*)" with a family drive$/,
  async ({ world }, familyName: string) => {
    const session = await ownSessionOf(world);
    const family = await createFamilyAs(world.api, session, familyName);
    const drives = await waitForDrives(world.api, session, (listed) =>
      listed.some((drive) => drive.familyId === family.id),
    );
    world.families.push({ id: family.id, name: familyName });
    world.files = {
      drives: world.files?.drives ?? {},
      personalDriveIds: world.files?.personalDriveIds ?? {},
      familyDriveIds: {
        ...world.files?.familyDriveIds,
        [familyName]: drives.find((drive) => drive.familyId === family.id)?.id ?? "",
      },
      folderIds: world.files?.folderIds ?? {},
    };
  },
);

Given(/^Ben becomes a member of the family "([^"]*)"$/, async ({ world }, familyName: string) => {
  const ben = await signedInPerson(world.api, "Ben");
  world.people = { ...world.people, Ben: ben };
  const family = world.families.find((created) => created.name === familyName);
  if (family === undefined) {
    throw new Error(`The family ${familyName} does not exist.`);
  }
  await joinFamilyAs(world.api, await ownSessionOf(world), family.id, ben.session);
});

Given(
  /^Ben has uploaded the file "([^"]*)" to the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const ben = world.people?.Ben;
    if (ben === undefined) {
      throw new Error("Ben has not joined a family.");
    }
    const driveId = await benFamilyDriveIdOf(world, ben.session, familyName);
    const response = await uploadFileAs(world.api, ben.session, driveId, {
      name,
      parentId: null,
      body: "First draft",
    });
    expect(response.status, `Ben uploads ${name}`).toBe(201);
  },
);

Given(
  /^Ben has saved a new version of "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const ben = world.people?.Ben;
    if (ben === undefined) {
      throw new Error("Ben has not joined a family.");
    }
    const driveId = await benFamilyDriveIdOf(world, ben.session, familyName);
    const fileId = await fileIdIn(world, ben.session, driveId, name);
    const response = await uploadVersionAs(world.api, ben.session, fileId, "Second draft");
    expect(response.status, `Ben saves a new version of ${name}`).toBe(201);
  },
);

Given(
  /^Anna has a personal-drive file "([^"]*)" in the nested folder "([^"]*)"$/,
  async ({ world }, name: string, folderName: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdOf(world);
    const folderId = await findFolderFrom(
      world.api,
      session,
      [{ kind: "drive", id: driveId }],
      folderName,
    );
    const response = await uploadFileAs(world.api, session, driveId, {
      name,
      parentId: folderId,
      body: "Beach",
    });
    expect(response.status, `Anna has ${name} in ${folderName}`).toBe(201);
  },
);

When(/^Anna opens the details of "([^"]*)" on a phone$/, async ({ page, world }, name: string) => {
  const session = await ownSessionOf(world);
  const driveId = await personalDriveIdOf(world);
  const fileId = await fileIdIn(world, session, driveId, name);
  await openDetailsPage(page, `/files/${driveId}/file/${fileId}`);
  await page.getByTestId("file-details-page").waitFor();
});

When(
  /^Anna opens the details of "([^"]*)" in the family drive of "([^"]*)" on a phone$/,
  async ({ page, world }, name: string, familyName: string) => {
    const session = await ownSessionOf(world);
    const driveId = familyDriveIdOf(world, familyName);
    const fileId = await fileIdIn(world, session, driveId, name);
    await openDetailsPage(page, `/files/${driveId}/file/${fileId}`);
    await waitForDetails(page);
  },
);

When(
  "Anna opens the details of the file with a very long name on a phone",
  async ({ page, world }) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdOf(world);
    const fileId = await fileIdIn(world, session, driveId, LONG_FILE_NAME);
    await openDetailsPage(page, `/files/${driveId}/file/${fileId}`);
    await waitForDetails(page);
  },
);

When("Anna opens a file link that does not exist on a phone", async ({ page, world }) => {
  const driveId = await personalDriveIdOf(world);
  await openDetailsPage(page, `/files/${driveId}/file/${randomUUID()}`);
});

When(
  /^Anna opens the details link of the folder "([^"]*)" on a phone$/,
  async ({ page, world }, name: string) => {
    const session = await ownSessionOf(world);
    const driveId = await personalDriveIdOf(world);
    const folderId = await findFolderFrom(
      world.api,
      session,
      [{ kind: "drive", id: driveId }],
      name,
    );
    await openDetailsPage(page, `/files/${driveId}/file/${folderId}`);
  },
);

When(/^Anna taps the file row "([^"]*)"$/, async ({ page }, name: string) => {
  await phoneRowNamed(page, name).getByTestId("file-row-activate").click();
});

When("Anna taps the details Back control", async ({ page }) => {
  await page.getByTestId("file-details-back").click();
});

When("Anna opens the Activity tab", async ({ page }) => {
  await page.getByTestId("segmented-option-activity").click();
});

Then(
  /^Anna sees the details of "([^"]*)" with type, size, location, modified, created and version$/,
  async ({ page }, name: string) => {
    await waitForDetails(page);
    await expect(page.getByTestId("file-details-name")).toHaveText(name);
    for (const key of ["type", "size", "location", "modified", "created", "version"]) {
      await expect(propertyRow(page, key)).toBeVisible();
    }
  },
);

Then(/^the details location reads (.+)$/, async ({ page }, listing: string) => {
  await expect(page.getByTestId("file-details-location")).toHaveText(
    namesIn(listing).join(LOCATION_SEPARATOR),
  );
});

Then("Anna sees the file not found view with a link to Files", async ({ page }) => {
  await expect(page.getByTestId("file-not-found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to Files" })).toHaveAttribute("href", "/files");
});

Then(
  /^"Who has access" lists every family member with their role and "Can edit"$/,
  async ({ page }) => {
    const rows = accessRows(page);
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Can edit");
    await expect(rows.nth(1)).toContainText("Can edit");
  },
);

Then(
  /^"Who has access" lists only "([^"]*)" as "([^"]*)"$/,
  async ({ page }, name: string, role: string) => {
    await expect(accessRows(page)).toHaveCount(1);
    await expect(accessRows(page).first()).toContainText(name);
    await expect(accessRows(page).first()).toContainText(role);
  },
);

Then(/^Modified shows "([^"]*)"$/, async ({ page }, text: string) => {
  await expect(propertyRow(page, "modified")).toContainText(text);
});

Then(
  /^the Activity list reads "([^"]*)" then "([^"]*)"$/,
  async ({ page }, newer: string, older: string) => {
    const rows = page.getByTestId("file-activity-row");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText(newer);
    await expect(rows.nth(1)).toContainText(older);
  },
);

Then(
  "the details screen has no Linked entities, Tags and notes, Encrypted or Share section",
  async ({ page }) => {
    for (const text of ["Linked entities", "Tags and notes", "Encrypted", "Share"]) {
      await expect(page.getByText(text, { exact: true })).toHaveCount(0);
    }
  },
);
