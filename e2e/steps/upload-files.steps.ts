// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { listItemsAs, uploadFileAs, waitForDrives } from "../support/factories/files.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const sessionOf = (world: ScenarioWorld, name: string): Session => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person.session;
};

const familyNamed = (world: ScenarioWorld, name: string): { id: string; name: string } => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family ${name} does not exist`);
  }
  return family;
};

const personalDriveIdOf = async (world: ScenarioWorld, name: string): Promise<string> => {
  const drives = await waitForDrives(world.api, sessionOf(world, name), (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  return drives.find((drive) => drive.familyId === null)?.id ?? "";
};

const familyDriveIdOf = async (
  world: ScenarioWorld,
  name: string,
  familyName: string,
): Promise<string> => {
  const family = familyNamed(world, familyName);
  const drives = await waitForDrives(world.api, sessionOf(world, name), (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  return drives.find((drive) => drive.familyId === family.id)?.id ?? "";
};

const folderIdInRoot = async (world: ScenarioWorld, name: string, folderName: string) => {
  const driveId = await personalDriveIdOf(world, name);
  const items = await listItemsAs(world.api, sessionOf(world, name), {
    kind: "drive",
    id: driveId,
  });
  const folder = items.find((item) => item.isFolder && item.name === folderName);
  if (folder === undefined) {
    throw new Error(`The folder ${folderName} is not in the personal drive of ${name}`);
  }
  return folder.id;
};

const uploadTo = async (
  world: ScenarioWorld,
  person: string,
  driveId: string,
  name: string,
  parentId: string | null,
): Promise<void> => {
  world.response = await uploadFileAs(world.api, sessionOf(world, person), driveId, {
    name,
    parentId,
    body: `Contents of ${name}`,
  });
};

const namesIn = async (
  world: ScenarioWorld,
  person: string,
  container: { kind: "drive" | "folder"; id: string },
): Promise<string[]> =>
  (await listItemsAs(world.api, sessionOf(world, person), container)).map((item) => item.name);

Given(/^Anna has a file "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  const response = await uploadFileAs(world.api, sessionOf(world, "Anna"), driveId, {
    name,
    parentId: null,
    body: `Contents of ${name}`,
  });
  expect(response.status, `Anna has a file ${name}`).toBe(201);
});

When(/^Anna uploads the file "([^"]*)" to her personal drive$/, async ({ world }, name: string) => {
  await uploadTo(world, "Anna", await personalDriveIdOf(world, "Anna"), name, null);
});

When(
  /^Anna uploads the file "([^"]*)" into the folder "([^"]*)"$/,
  async ({ world }, name: string, folderName: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    const folderId = await folderIdInRoot(world, "Anna", folderName);
    await uploadTo(world, "Anna", driveId, name, folderId);
  },
);

When(
  /^(Anna|Ben) uploads the file "([^"]*)" to the family drive of "([^"]*)"$/,
  async ({ world }, person: string, name: string, familyName: string) => {
    const driveId = await familyDriveIdOf(world, person, familyName);
    await uploadTo(world, person, driveId, name, null);
  },
);

Then(/^Anna sees the file "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  expect(await namesIn(world, "Anna", { kind: "drive", id: driveId })).toContain(name);
});

Then(
  /^Anna sees the file "([^"]*)" in the folder "([^"]*)"$/,
  async ({ world }, name: string, folderName: string) => {
    const folderId = await folderIdInRoot(world, "Anna", folderName);
    expect(await namesIn(world, "Anna", { kind: "folder", id: folderId })).toContain(name);
  },
);

Then(
  /^Ben sees the file "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveIdOf(world, "Ben", familyName);
    expect(await namesIn(world, "Ben", { kind: "drive", id: driveId })).toContain(name);
  },
);

Then("Anna is told a file with this name already exists", ({ world }) => {
  expect(world.response?.status, "Anna is told the name is taken").toBe(409);
});
