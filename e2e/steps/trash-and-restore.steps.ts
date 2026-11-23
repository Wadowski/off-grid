// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  deleteAs,
  downloadAs,
  findItemAcrossDrives,
  getAs,
  joinFamilyAs,
  listItemsAs,
  postAs,
  uploadFileAs,
  waitForDrives,
} from "../support/factories/files.js";
import type { JsonResponse, Session } from "../support/factories/instance-admin.js";
import { signedInPerson } from "../support/factories/notifications.js";
import type { FileItem } from "../support/factories/types.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { worldFamilyNamed } from "../support/world-family-named.js";
import { worldSessionOf } from "../support/world-session-of.js";

const { Given, When, Then } = createBdd(test);

const remember = (world: ScenarioWorld, name: string, id: string): void => {
  const files = world.files ?? { drives: {}, personalDriveIds: {}, familyDriveIds: {} };
  world.files = { ...files, fileIds: { ...files.fileIds, [name]: id } };
};

const rememberedIdOf = (world: ScenarioWorld, name: string): string | undefined =>
  world.files?.fileIds?.[name];

const requireId = (id: string | undefined, name: string): string => {
  if (id === undefined) {
    throw new Error(`The entry ${name} is not known`);
  }
  return id;
};

const personalDriveIdOf = async (world: ScenarioWorld, name: string): Promise<string> => {
  const drives = await waitForDrives(world.api, worldSessionOf(world, name), (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  return drives.find((drive) => drive.familyId === null)?.id ?? "";
};

const familyDriveIdOf = async (
  world: ScenarioWorld,
  actor: string,
  familyName: string,
): Promise<string> => {
  const family = worldFamilyNamed(world, familyName);
  const drives = await waitForDrives(world.api, worldSessionOf(world, actor), (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
  return drives.find((drive) => drive.familyId === family.id)?.id ?? "";
};

const liveIdOf = (world: ScenarioWorld, name: string): Promise<string | undefined> =>
  findItemAcrossDrives(world.api, worldSessionOf(world, "Anna"), name).then(
    (item) => item.id,
    () => undefined,
  );

const trashedItemsOf = async (
  world: ScenarioWorld,
  session: Session,
  driveId: string,
): Promise<FileItem[]> => {
  const response = await getAs(world.api, session, `/api/drives/${driveId}/trash`);
  if (response.status !== 200) {
    throw new Error(`The trash could not be listed (${response.status}).`);
  }
  return (response.body as { items: FileItem[] }).items;
};

const trashedIdOf = async (world: ScenarioWorld, name: string): Promise<string | undefined> => {
  const driveId = await personalDriveIdOf(world, "Anna");
  const items = await trashedItemsOf(world, worldSessionOf(world, "Anna"), driveId);
  return items.find((item) => item.name === name)?.id;
};

const entryIdOf = async (world: ScenarioWorld, name: string): Promise<string> =>
  requireId(
    rememberedIdOf(world, name) ??
      (await liveIdOf(world, name)) ??
      (await trashedIdOf(world, name)),
    name,
  );

const createFolderIn = async (
  world: ScenarioWorld,
  driveId: string,
  parentId: string | null,
  name: string,
): Promise<string> => {
  const response = await postAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/drives/${driveId}/folders`,
    {
      parentId,
      name,
    },
  );
  if (response.status !== 201) {
    throw new Error(`The folder ${name} could not be created (${response.status}).`);
  }
  return (response.body as { id: string }).id;
};

const uploadIn = async (
  world: ScenarioWorld,
  actor: string,
  driveId: string,
  parentId: string | null,
  name: string,
): Promise<string> => {
  const response = await uploadFileAs(world.api, worldSessionOf(world, actor), driveId, {
    name,
    parentId,
    body: `Contents of ${name}`,
  });
  if (response.status !== 201) {
    throw new Error(`The file ${name} could not be uploaded (${response.status}).`);
  }
  return (response.body as { id: string }).id;
};

const trashAs = async (world: ScenarioWorld, actor: string, id: string): Promise<void> => {
  const response = await postAs(
    world.api,
    worldSessionOf(world, actor),
    `/api/files/${id}/trash`,
    undefined,
  );
  expect(response.status, "the entry is moved to the trash").toBe(200);
};

const responseOf = (world: ScenarioWorld): JsonResponse => {
  if (world.response === undefined) {
    throw new Error("No request was made");
  }
  return world.response;
};

const childrenNamesOf = async (
  world: ScenarioWorld,
  actor: string,
  container: { kind: "drive" | "folder"; id: string },
): Promise<string[]> =>
  (await listItemsAs(world.api, worldSessionOf(world, actor), container)).map((item) => item.name);

const trashNamesOf = async (
  world: ScenarioWorld,
  actor: string,
  driveId: string,
): Promise<string[]> =>
  (await trashedItemsOf(world, worldSessionOf(world, actor), driveId)).map((item) => item.name);

Given(/^a new person Chris signs up$/, async ({ world }) => {
  world.people = { ...world.people, Chris: await signedInPerson(world.api, "Chris") };
});

Given(/^Ben is a member of "([^"]*)"$/, async ({ world }, familyName: string) => {
  const family = worldFamilyNamed(world, familyName);
  await joinFamilyAs(
    world.api,
    worldSessionOf(world, "Anna"),
    family.id,
    worldSessionOf(world, "Ben"),
  );
  await waitForDrives(world.api, worldSessionOf(world, "Ben"), (listed) =>
    listed.some((drive) => drive.familyId === family.id),
  );
});

Given(
  /^Anna has a folder "([^"]*)" with a file "([^"]*)"$/,
  async ({ world }, folderName: string, fileName: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    const folderId = await createFolderIn(world, driveId, null, folderName);
    remember(world, folderName, folderId);
    const fileId = await uploadIn(world, "Anna", driveId, folderId, fileName);
    remember(world, fileName, fileId);
  },
);

Given(
  /^Anna has a folder "([^"]*)" with a file "([^"]*)" in the trash$/,
  async ({ world }, folderName: string, fileName: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    const folderId = await createFolderIn(world, driveId, null, folderName);
    remember(world, folderName, folderId);
    const fileId = await uploadIn(world, "Anna", driveId, folderId, fileName);
    remember(world, fileName, fileId);
    await trashAs(world, "Anna", folderId);
  },
);

Given(
  /^Anna has a file "([^"]*)" in the trash, inside a folder "([^"]*)" that is in the trash$/,
  async ({ world }, fileName: string, folderName: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    const folderId = await createFolderIn(world, driveId, null, folderName);
    remember(world, folderName, folderId);
    const fileId = await uploadIn(world, "Anna", driveId, folderId, fileName);
    remember(world, fileName, fileId);
    await trashAs(world, "Anna", fileId);
    await trashAs(world, "Anna", folderId);
  },
);

Given(/^Anna has a file "([^"]*)" in the trash$/, async ({ world }, name: string) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  const fileId = await uploadIn(world, "Anna", driveId, null, name);
  remember(world, name, fileId);
  await trashAs(world, "Anna", fileId);
});

Given(
  /^Anna has a file "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveIdOf(world, "Anna", familyName);
    const fileId = await uploadIn(world, "Anna", driveId, null, name);
    remember(world, name, fileId);
  },
);

When(
  /^(Anna|Ben|Chris) moves the (?:file|folder) "([^"]*)" to the trash$/,
  async ({ world }, actor: string, name: string) => {
    const id = await entryIdOf(world, name);
    world.response = await postAs(
      world.api,
      worldSessionOf(world, actor),
      `/api/files/${id}/trash`,
      undefined,
    );
  },
);

When(
  /^(Anna|Ben) restores the (?:file|folder) "([^"]*)"$/,
  async ({ world }, actor: string, name: string) => {
    const id = requireId(rememberedIdOf(world, name) ?? (await trashedIdOf(world, name)), name);
    world.response = await postAs(
      world.api,
      worldSessionOf(world, actor),
      `/api/files/${id}/restore`,
      undefined,
    );
  },
);

When(/^Anna restores the file "([^"]*)" from the trash$/, async ({ world }, name: string) => {
  const id = requireId(await trashedIdOf(world, name), name);
  world.response = await postAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/files/${id}/restore`,
    undefined,
  );
});

When(/^Anna permanently deletes the file "([^"]*)"$/, async ({ world }, name: string) => {
  const id = await entryIdOf(world, name);
  world.response = await deleteAs(world.api, worldSessionOf(world, "Anna"), `/api/files/${id}`);
});

When(/^Anna empties the trash of her personal drive$/, async ({ world }) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  world.response = await deleteAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/drives/${driveId}/trash`,
  );
});

Then(/^Anna does not see "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  expect(await childrenNamesOf(world, "Anna", { kind: "drive", id: driveId })).not.toContain(name);
});

Then(
  /^Anna sees "([^"]*)" in the trash of her personal drive$/,
  async ({ world }, name: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    expect(await trashNamesOf(world, "Anna", driveId)).toContain(name);
  },
);

Then(/^Anna does not see "([^"]*)" in the trash$/, async ({ world }, name: string) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  expect(await trashNamesOf(world, "Anna", driveId)).not.toContain(name);
});

Then("the trash of her personal drive is empty", async ({ world }) => {
  const driveId = await personalDriveIdOf(world, "Anna");
  expect(await trashedItemsOf(world, worldSessionOf(world, "Anna"), driveId)).toHaveLength(0);
});

Then(/^Anna cannot open the folder "([^"]*)"$/, async ({ world }, name: string) => {
  const response = await getAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/files/${requireId(rememberedIdOf(world, name), name)}/children`,
  );
  expect(response.status, `Anna cannot open the folder ${name}`).toBe(404);
});

Then(/^Anna cannot open the file "([^"]*)"$/, async ({ world }, name: string) => {
  const response = await getAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/files/${requireId(rememberedIdOf(world, name), name)}`,
  );
  expect(response.status, `Anna cannot open the file ${name}`).toBe(404);
});

Then(/^Anna cannot download the file "([^"]*)"$/, async ({ world }, name: string) => {
  const response = await downloadAs(
    world.api,
    worldSessionOf(world, "Anna"),
    `/api/files/${requireId(rememberedIdOf(world, name), name)}/content`,
  );
  expect(response.status, `Anna cannot download the file ${name}`).toBe(404);
});

Then(
  /^Anna sees the file "([^"]*)" inside the folder "([^"]*)"$/,
  async ({ world }, fileName: string, folderName: string) => {
    const names = await childrenNamesOf(world, "Anna", {
      kind: "folder",
      id: requireId(rememberedIdOf(world, folderName), folderName),
    });
    expect(names).toContain(fileName);
  },
);

Then(
  /^Anna sees the file "([^"]*)" at the root of her personal drive$/,
  async ({ world }, name: string) => {
    const driveId = await personalDriveIdOf(world, "Anna");
    expect(await childrenNamesOf(world, "Anna", { kind: "drive", id: driveId })).toContain(name);
  },
);

Then("Anna is told the file is not in the trash", ({ world }) => {
  const response = responseOf(world);
  expect(response.status, "the file is not in the trash").toBe(409);
  expect(response.body, "the file is not in the trash").toMatchObject({ code: "NOT_TRASHED" });
});

Then(/^Chris is told the file was not found$/, ({ world }) => {
  expect(responseOf(world).status, "Chris is told the file was not found").toBe(404);
});

Then(
  /^Ben sees "([^"]*)" in the trash of the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveIdOf(world, "Ben", familyName);
    expect(await trashNamesOf(world, "Ben", driveId)).toContain(name);
  },
);

Then(
  /^Ben sees "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const driveId = await familyDriveIdOf(world, "Ben", familyName);
    expect(await childrenNamesOf(world, "Ben", { kind: "drive", id: driveId })).toContain(name);
  },
);
