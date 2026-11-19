// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  joinFamilyAs,
  listItemsAs,
  postAs,
  waitForDrives,
  type FileItem,
} from "../support/factories/files.js";
import { signedInPerson } from "../support/factories/notifications.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

type Container = { kind: "drive" | "folder"; id: string };

const ensurePerson = async (world: ScenarioWorld, name: string): Promise<void> => {
  if (world.people?.[name] === undefined) {
    world.people = { ...world.people, [name]: await signedInPerson(world.api, name) };
  }
};

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

const personalDriveOf = async (world: ScenarioWorld, name: string): Promise<string> => {
  await ensurePerson(world, name);
  const drives = await waitForDrives(world.api, sessionOf(world, name), (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  return drives.find((drive) => drive.familyId === null)?.id ?? "";
};

const familyDriveOf = async (world: ScenarioWorld, name: string): Promise<string> => {
  const family = familyNamed(world, name);
  const drives = await waitForDrives(world.api, sessionOf(world, "Anna"), (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  return drives.find((drive) => drive.familyId === family.id)?.id ?? "";
};

const rootOf = (driveId: string): Container => ({ kind: "drive", id: driveId });

const folderIdIn = async (
  world: ScenarioWorld,
  session: Session,
  container: Container,
  name: string,
): Promise<string> => {
  const items = await listItemsAs(world.api, session, container);
  const folder = items.find((item) => item.isFolder && item.name === name);
  if (folder === undefined) {
    throw new Error(`The folder ${name} is not in the container`);
  }
  return folder.id;
};

const folderIdInDrive = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
  path: string[],
): Promise<string> => {
  let container = rootOf(driveId);
  let folderId = "";
  for (const name of path) {
    folderId = await folderIdIn(world, session, container, name);
    container = { kind: "folder", id: folderId };
  }
  return folderId;
};

const createFolderIn = async (
  world: ScenarioWorld,
  actor: string,
  parentId: string | null,
  driveId: string,
  name: string,
): Promise<void> => {
  const response = await postAs(world.api, sessionOf(world, actor), `/api/drives/${driveId}/folders`, {
    parentId,
    name,
  });
  if (response.status !== 201) {
    throw new Error(`The folder ${name} could not be created (${response.status}).`);
  }
};

const parentPathOf = async (
  world: ScenarioWorld,
  driveId: string,
  parentName: string | undefined,
): Promise<string | null> => {
  if (parentName === undefined) {
    return null;
  }
  return folderIdInDrive(world, sessionOf(world, "Anna"), driveId, [parentName]);
};

Given(/^Anna has a folder "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveOf(world, "Anna");
  await createFolderIn(world, "Anna", null, driveId, name);
});

Given(/^Ben has a folder "([^"]*)" in his personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveOf(world, "Ben");
  await createFolderIn(world, "Ben", null, driveId, name);
});

Given(
  /^Anna has a folder "([^"]*)" with a folder "([^"]*)" inside it$/,
  async ({ world }, parentName: string, childName: string) => {
    const driveId = await personalDriveOf(world, "Anna");
    await createFolderIn(world, "Anna", null, driveId, parentName);
    const parentId = await folderIdInDrive(world, sessionOf(world, "Anna"), driveId, [parentName]);
    await createFolderIn(world, "Anna", parentId, driveId, childName);
  },
);

Given(
  /^Anna has the folders "([^"]*)" and "([^"]*)" nested in her personal drive$/,
  async ({ world }, outerName: string, innerName: string) => {
    const driveId = await personalDriveOf(world, "Anna");
    await createFolderIn(world, "Anna", null, driveId, outerName);
    const outerId = await folderIdInDrive(world, sessionOf(world, "Anna"), driveId, [outerName]);
    await createFolderIn(world, "Anna", outerId, driveId, innerName);
  },
);

Given(
  /^Anna has a folder "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveOf(world, familyName);
    await createFolderIn(world, "Anna", null, driveId, name);
  },
);

Given(/^Ben joins the family "([^"]*)"$/, async ({ world }, familyName: string) => {
  await ensurePerson(world, "Ben");
  const family = familyNamed(world, familyName);
  await joinFamilyAs(world.api, sessionOf(world, "Anna"), family.id, sessionOf(world, "Ben"));
  await waitForDrives(world.api, sessionOf(world, "Ben"), (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
});

When(/^Anna creates the folder "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveOf(world, "Anna");
  world.response = await postAs(world.api, sessionOf(world, "Anna"), `/api/drives/${driveId}/folders`, {
    parentId: null,
    name,
  });
});

When(
  /^Anna creates the folder "([^"]*)" inside "([^"]*)"$/,
  async ({ world }, name: string, parentName: string) => {
    const driveId = await personalDriveOf(world, "Anna");
    const parentId = await parentPathOf(world, driveId, parentName);
    world.response = await postAs(world.api, sessionOf(world, "Anna"), `/api/drives/${driveId}/folders`, {
      parentId,
      name,
    });
  },
);

When(
  /^Ben creates the folder "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveOf(world, familyName);
    world.response = await postAs(world.api, sessionOf(world, "Ben"), `/api/drives/${driveId}/folders`, {
      parentId: null,
      name,
    });
  },
);

Then(/^Anna sees the folder "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const items = await listItemsAs(world.api, sessionOf(world, "Anna"), rootOf(await personalDriveOf(world, "Anna")));
  expect(items.map((item: FileItem) => item.name)).toContain(name);
});

Then(/^Anna does not see the folder "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const items = await listItemsAs(world.api, sessionOf(world, "Anna"), rootOf(await personalDriveOf(world, "Anna")));
  expect(items.map((item: FileItem) => item.name)).not.toContain(name);
});

Then(
  /^Anna sees the folder "([^"]*)" inside "([^"]*)"$/,
  async ({ world }, name: string, parentName: string) => {
    const driveId = await personalDriveOf(world, "Anna");
    const parentId = await folderIdInDrive(world, sessionOf(world, "Anna"), driveId, [parentName]);
    const items = await listItemsAs(world.api, sessionOf(world, "Anna"), { kind: "folder", id: parentId });
    expect(items.map((item: FileItem) => item.name)).toContain(name);
  },
);

Then(
  /^Anna sees the folder "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveOf(world, familyName);
    const items = await listItemsAs(world.api, sessionOf(world, "Anna"), rootOf(driveId));
    expect(items.map((item: FileItem) => item.name)).toContain(name);
  },
);

Then(
  /^Anna is told the name is taken$/,
  async ({ world }) => {
    expect(world.response?.status).toBe(409);
    expect(world.response?.body).toMatchObject({ code: "NAME_TAKEN" });
  },
);


const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-113 rename and move): ${step}`);
};

When(/^Anna renames the folder "[^"]*" to "[^"]*"$/, () => notImplemented("Anna renames the folder"));
When(/^Anna moves the folder "[^"]*" into "[^"]*"$/, () => notImplemented("Anna moves the folder into"));
Then("Anna is told the move is not allowed", () => notImplemented("the move is not allowed"));
When(/^Anna moves the folder "[^"]*" to the family drive of "[^"]*"$/, () =>
  notImplemented("Anna moves the folder to the family drive"),
);
Then("Anna is told the folder was moved to another owner", () =>
  notImplemented("the folder was moved to another owner"),
);
Then(/^Anna sees the folder "[^"]*" inside "[^"]*" in the family drive of "[^"]*"$/, () =>
  notImplemented("Anna sees the folder inside in the family drive"),
);
When(/^Anna moves the folder "[^"]*" to the personal drive of Ben$/, () =>
  notImplemented("Anna moves the folder to the personal drive of Ben"),
);
When(/^Ben renames the folder "[^"]*" in the family drive of "[^"]*" to "[^"]*"$/, () =>
  notImplemented("Ben renames the folder"),
);
When(/^Ben moves the folder "[^"]*" from the family drive of "[^"]*" to his personal drive$/, () =>
  notImplemented("Ben moves the folder"),
);
