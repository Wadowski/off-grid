// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createBdd } from "playwright-bdd";
import {
  findFolderAcrossDrives,
  getAs,
  listDrivesAs,
  waitForDrives,
} from "../support/factories/files.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-113 and OG-114 create entries): ${step}`);
};

const personNamed = (world: ScenarioWorld, name: string) => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person;
};

const familyNamed = (world: ScenarioWorld, name: string) => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family ${name} does not exist`);
  }
  return family;
};

const lastFamilyOf = (world: ScenarioWorld) => {
  const family = world.families.at(-1);
  if (family === undefined) {
    throw new Error("No family has been created");
  }
  return family;
};

When("Anna lists her drives", async ({ world }) => {
  const family = lastFamilyOf(world);
  const drives = await waitForDrives(
    world.api,
    personNamed(world, "Anna").session,
    (listed) =>
      listed.some((drive) => drive.familyId === null) &&
      listed.some((drive) => drive.familyId === family.id),
  );
  world.files = {
    drives: { ...world.files?.drives, Anna: drives },
    personalDriveIds: world.files?.personalDriveIds ?? {},
    familyDriveIds: {
      ...world.files?.familyDriveIds,
      [family.name]: drives.find((drive) => drive.familyId === family.id)?.id ?? "",
    },
  };
});

Then(/^Anna sees her personal drive named "([^"]*)"$/, async ({ world }, name: string) => {
  const drives = world.files?.drives.Anna ?? [];
  expect(drives.filter((drive) => drive.familyId === null).map((drive) => drive.name)).toEqual([
    name,
  ]);
});

Then(/^Anna sees the family drive named "([^"]*)"$/, async ({ world }, name: string) => {
  const drives = world.files?.drives.Anna ?? [];
  expect(drives.filter((drive) => drive.familyId !== null).map((drive) => drive.name)).toContain(
    name,
  );
});

When(/^Ben opens the family drive of "([^"]*)"$/, async ({ world }, familyName: string) => {
  const family = familyNamed(world, familyName);
  const annaDrives = await waitForDrives(world.api, personNamed(world, "Anna").session, (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  const driveId = annaDrives.find((drive) => drive.familyId === family.id)?.id ?? "";
  world.response = await getAs(
    world.api,
    personNamed(world, "Ben").session,
    `/api/drives/${driveId}/children`,
  );
});

When("Ben opens the personal drive of Anna", async ({ world }) => {
  const driveId = world.files?.personalDriveIds.Anna;
  if (!driveId) {
    throw new Error("Anna has no personal drive");
  }
  world.response = await getAs(
    world.api,
    personNamed(world, "Ben").session,
    `/api/drives/${driveId}/children`,
  );
});

Then(
  /^(Anna|Ben) is told the (drive|folder|file) was not found$/,
  async ({ world }, person: string, kind: string) => {
    expect(world.response?.status, `${person} is told the ${kind} was not found`).toBe(404);
  },
);

When("Anna opens a folder that does not exist", async ({ world }) => {
  world.response = await getAs(
    world.api,
    personNamed(world, "Anna").session,
    `/api/files/${randomUUID()}/children`,
  );
});

When("Anna opens a file that does not exist", async ({ world }) => {
  world.response = await getAs(
    world.api,
    personNamed(world, "Anna").session,
    `/api/files/${randomUUID()}`,
  );
});

Given(/^Anna has a folder "[^"]*" with a folder "[^"]*" and a file "[^"]*"$/, () =>
  notImplemented("Anna has a folder … with a folder … and a file …"),
);

When(/^(Anna|Ben) opens the folder "([^"]*)"$/, async ({ world }, actor: string, name: string) => {
  const drives = await listDrivesAs(world.api, personNamed(world, "Anna").session);
  const folderId = await findFolderAcrossDrives(
    world.api,
    personNamed(world, "Anna").session,
    drives,
    name,
  );
  world.response = await getAs(
    world.api,
    personNamed(world, actor).session,
    `/api/files/${folderId}/children`,
  );
});

Then(/^Anna sees the entries "[^"]*" and "[^"]*" in that order$/, () =>
  notImplemented("Anna sees the entries … and … in that order"),
);

Then(/^the breadcrumbs of the folder are "[^"]*" then "[^"]*"$/, () =>
  notImplemented("the breadcrumbs of the folder are … then …"),
);

Then(/^the breadcrumbs of the folder are "[^"]*", "[^"]*" and "[^"]*"$/, () =>
  notImplemented("the breadcrumbs of the folder are …, … and …"),
);

Given(/^Anna has a file "[^"]*" in the folder "[^"]*"$/, () =>
  notImplemented("Anna has a file … in the folder …"),
);

Given(/^Anna has a trashed folder "[^"]*" in her personal drive$/, () =>
  notImplemented("Anna has a trashed folder … in her personal drive"),
);

When(/^(?:Anna|Ben) opens the file "[^"]*"$/, () => notImplemented("opens the file …"));

Then(/^Anna sees the file "[^"]*" with the breadcrumbs "[^"]*" and "[^"]*"$/, () =>
  notImplemented("Anna sees the file … with the breadcrumbs … and …"),
);

Given(/^Anna has a folder "[^"]*" with a trashed file "[^"]*"$/, () =>
  notImplemented("Anna has a folder … with a trashed file …"),
);

Then(/^Anna does not see "[^"]*"$/, () => notImplemented("Anna does not see …"));

Given(/^Anna has a folder "[^"]*" holding \d+ files$/, () =>
  notImplemented("Anna has a folder … holding … files"),
);

Then(/^Anna sees \d+ entries with a way to get the next page$/, () =>
  notImplemented("Anna sees … entries with a way to get the next page"),
);
