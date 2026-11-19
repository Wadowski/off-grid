// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  createFamilyAs,
  familyNamesAs,
  listDrivesAs,
  waitForDrives,
} from "../support/factories/files.js";
import { signedInPerson } from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const ensurePerson = async (world: ScenarioWorld, name: string): Promise<void> => {
  if (world.people?.[name] === undefined) {
    world.people = { ...world.people, [name]: await signedInPerson(world.api, name) };
  }
};

const personNamed = (world: ScenarioWorld, name: string) => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person;
};

const familyNamed = (world: ScenarioWorld, name: string): { id: string; name: string } => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family ${name} does not exist`);
  }
  return family;
};

const recordPersonalDrive = async (world: ScenarioWorld, name: string): Promise<void> => {
  await ensurePerson(world, name);
  const session = personNamed(world, name).session;
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  world.files = {
    drives: { ...world.files?.drives, [name]: drives },
    personalDriveIds: {
      ...world.files?.personalDriveIds,
      [name]: drives.find((drive) => drive.familyId === null)?.id ?? "",
    },
    familyDriveIds: world.files?.familyDriveIds ?? {},
  };
};

const recordFamilyDrive = async (world: ScenarioWorld, familyName: string): Promise<void> => {
  const family = familyNamed(world, familyName);
  const session = personNamed(world, "Anna").session;
  const drives = await waitForDrives(world.api, session, (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  world.files = {
    drives: world.files?.drives ?? {},
    personalDriveIds: world.files?.personalDriveIds ?? {},
    familyDriveIds: {
      ...world.files?.familyDriveIds,
      [familyName]: drives.find((drive) => drive.familyId === family.id)?.id ?? "",
    },
  };
};

Given(/^a new person (Anna|Ben) signs up$/, async ({ world }, name: string) => {
  await ensurePerson(world, name);
});

When(/^her personal drive is created$/, async ({ world }) => {
  await recordPersonalDrive(world, "Anna");
});

When(/^her personal drive is created twice$/, async ({ world }) => {
  await recordPersonalDrive(world, "Anna");
});

Then(/^Anna has exactly one personal drive named "([^"]*)"$/, async ({ world }, name: string) => {
  const drives = await listDrivesAs(world.api, personNamed(world, "Anna").session);
  const personal = drives.filter((drive) => drive.familyId === null);
  expect(personal).toHaveLength(1);
  expect(personal[0]?.name).toBe(name);
});

Given(/^a new family named "([^"]*)" is created by Anna$/, async ({ world }, name: string) => {
  await ensurePerson(world, "Anna");
  const family = await createFamilyAs(world.api, personNamed(world, "Anna").session, name);
  world.families.push(family);
});

When(/^the family drive is created$/, async ({ world }) => {
  const family = world.families.at(-1);
  if (family === undefined) {
    throw new Error("No family has been created");
  }
  await recordFamilyDrive(world, family.name);
});

Then(
  /^"([^"]*)" has exactly one family drive named "([^"]*)"$/,
  async ({ world }, familyName: string, driveName: string) => {
    const family = familyNamed(world, familyName);
    const drives = await listDrivesAs(world.api, personNamed(world, "Anna").session);
    const familyDrives = drives.filter((drive) => drive.familyId === family.id);
    expect(familyDrives).toHaveLength(1);
    expect(familyDrives[0]?.name).toBe(driveName);
  },
);

Given("Anna has a personal drive", async ({ world }) => {
  await recordPersonalDrive(world, "Anna");
});

Given("Ben is another person", async ({ world }) => {
  await ensurePerson(world, "Ben");
});

When("Ben lists the drives he can see", async ({ world }) => {
  const drives = await listDrivesAs(world.api, personNamed(world, "Ben").session);
  world.files = {
    drives: { ...world.files?.drives, Ben: drives },
    personalDriveIds: world.files?.personalDriveIds ?? {},
    familyDriveIds: world.files?.familyDriveIds ?? {},
  };
});

Then("Ben sees no personal drive of Anna", async ({ world }) => {
  const annaDriveId = world.files?.personalDriveIds.Anna;
  const drives = world.files?.drives.Ben ?? [];
  expect(drives.map((drive) => drive.id)).not.toContain(annaDriveId);
});

Given(/^"([^"]*)" has a family drive$/, async ({ world }, familyName: string) => {
  await ensurePerson(world, "Anna");
  if (!world.families.some((family) => family.name === familyName)) {
    world.families.push(
      await createFamilyAs(world.api, personNamed(world, "Anna").session, familyName),
    );
  }
  await recordFamilyDrive(world, familyName);
});

Given(/^Anna is a member of "([^"]*)"$/, async ({ world }, familyName: string) => {
  const names = await familyNamesAs(world.api, personNamed(world, "Anna").session);
  expect(names).toContain(familyName);
});

Given(/^Ben is not a member of "([^"]*)"$/, async ({ world }, familyName: string) => {
  await ensurePerson(world, "Ben");
  const names = await familyNamesAs(world.api, personNamed(world, "Ben").session);
  expect(names).not.toContain(familyName);
});

When("Anna and Ben list the drives they can see", async ({ world }) => {
  const anna = await listDrivesAs(world.api, personNamed(world, "Anna").session);
  const ben = await listDrivesAs(world.api, personNamed(world, "Ben").session);
  world.files = {
    drives: { ...world.files?.drives, Anna: anna, Ben: ben },
    personalDriveIds: world.files?.personalDriveIds ?? {},
    familyDriveIds: world.files?.familyDriveIds ?? {},
  };
});

Then(/^Anna sees the family drive of "([^"]*)"$/, async ({ world }, familyName: string) => {
  const driveId = world.files?.familyDriveIds[familyName];
  expect((world.files?.drives.Anna ?? []).map((drive) => drive.id)).toContain(driveId);
});

Then(/^Ben sees no family drive of "([^"]*)"$/, async ({ world }, familyName: string) => {
  const driveId = world.files?.familyDriveIds[familyName];
  expect((world.files?.drives.Ben ?? []).map((drive) => drive.id)).not.toContain(driveId);
});
