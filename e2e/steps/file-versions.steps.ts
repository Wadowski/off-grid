// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  deleteVersionAs,
  fileDetailsAs,
  findItemAcrossDrives,
  listDrivesAs,
  listItemsAs,
  listVersionsAs,
  oversizedUploadBody,
  restoreVersionAs,
  uploadFileAs,
  uploadVersionAs,
  waitForDrives,
} from "../support/factories/files.js";
import { leaveFamily } from "../support/family-sessions.js";
import type { JsonResponse, Session } from "../support/factories/instance-admin.js";
import type { FileVersionEntry } from "../support/factories/types.js";
import { signedInPerson } from "../support/factories/notifications.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const sessionOf = (world: ScenarioWorld, name: string): Session => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person.session;
};

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`The family ${name} does not exist`);
  }
  return family.id;
};

const personalDriveIdOf = async (world: ScenarioWorld, name: string): Promise<string> => {
  const drives = await waitForDrives(world.api, sessionOf(world, name), (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  return drives.find((drive) => drive.familyId === null)?.id ?? "";
};

const familyDriveIdOf = async (world: ScenarioWorld, familyName: string): Promise<string> => {
  const familyId = familyIdNamed(world, familyName);
  const drives = await waitForDrives(world.api, sessionOf(world, "Anna"), (listed) =>
    listed.some((drive) => drive.familyId === familyId),
  );
  return drives.find((drive) => drive.familyId === familyId)?.id ?? "";
};

const familyFileIdOf = async (
  world: ScenarioWorld,
  familyName: string,
  name: string,
): Promise<string> => {
  const familyId = familyIdNamed(world, familyName);
  const drives = await listDrivesAs(world.api, sessionOf(world, "Anna"));
  const drive = drives.find((listed) => listed.familyId === familyId);
  const items = await listItemsAs(world.api, sessionOf(world, "Anna"), {
    kind: "drive",
    id: drive?.id ?? "",
  });
  const item = items.find((listed) => listed.name === name);
  if (item === undefined) {
    throw new Error(`The file ${name} is not in the family drive of ${familyName}`);
  }
  return item.id;
};

const fileIdVisibleTo = async (
  world: ScenarioWorld,
  person: string,
  name: string,
): Promise<string> => (await findItemAcrossDrives(world.api, sessionOf(world, person), name)).id;

const versionsOf = async (
  world: ScenarioWorld,
  person: string,
  fileId: string,
): Promise<FileVersionEntry[]> => {
  const listed = await listVersionsAs(world.api, sessionOf(world, person), fileId);
  expect(listed.status, `${person} lists the versions`).toBe(200);
  return (listed.body as { versions: FileVersionEntry[] }).versions;
};

const currentVersionIdOf = async (
  world: ScenarioWorld,
  person: string,
  fileId: string,
): Promise<string> => {
  const details = await fileDetailsAs(world.api, sessionOf(world, person), fileId);
  return (details.body as { file: { currentVersionId: string } }).file.currentVersionId;
};

const newestNumberOf = (versions: FileVersionEntry[]): number =>
  Math.max(...versions.map((version) => version.number));

const numbersOf = (versions: FileVersionEntry[]): number[] =>
  versions.map((version) => version.number);

const expectVersions = async (
  world: ScenarioWorld,
  person: string,
  name: string,
  count: number,
  newestIsCurrent: boolean,
): Promise<void> => {
  const fileId = await fileIdVisibleTo(world, person, name);
  const versions = await versionsOf(world, person, fileId);
  expect(versions, `${person} sees ${count} versions of ${name}`).toHaveLength(count);
  if (newestIsCurrent) {
    expect(versions[0]?.number, "the newest version is listed first").toBe(
      newestNumberOf(versions),
    );
    expect(versions[0]?.id, "the newest version is the current one").toBe(
      await currentVersionIdOf(world, person, fileId),
    );
  }
};

const versionIdWithNumber = async (
  world: ScenarioWorld,
  person: string,
  name: string,
  number: number,
): Promise<{ fileId: string; versionId: string }> => {
  const fileId = await fileIdVisibleTo(world, person, name);
  const version = (await versionsOf(world, person, fileId)).find(
    (listed) => listed.number === number,
  );
  if (version === undefined) {
    throw new Error(`${name} has no version ${number}`);
  }
  return { fileId, versionId: version.id };
};

const sizeOf = async (world: ScenarioWorld, person: string, name: string): Promise<number> => {
  const fileId = await fileIdVisibleTo(world, person, name);
  const details = await fileDetailsAs(world.api, sessionOf(world, person), fileId);
  return (details.body as { file: { size: number } }).file.size;
};

const responseOf = (world: ScenarioWorld): JsonResponse => {
  if (world.response === undefined) {
    throw new Error("No response was recorded");
  }
  return world.response;
};

Given(/^a new person Carol signs up$/, async ({ world }) => {
  world.people = { ...world.people, Carol: await signedInPerson(world.api, "Carol") };
});

Given(
  /^Anna has a file "([^"]*)" with the content "([^"]*)" in her personal drive$/,
  async ({ world }, name: string, content: string) => {
    const response = await uploadFileAs(
      world.api,
      sessionOf(world, "Anna"),
      await personalDriveIdOf(world, "Anna"),
      {
        name,
        parentId: null,
        body: content,
      },
    );
    expect(response.status, `Anna has a file ${name}`).toBe(201);
  },
);

Given(/^Ben stops being a member of "([^"]*)"$/, async ({ world }, familyName: string) => {
  await leaveFamily(world.api, sessionOf(world, "Ben"), familyIdNamed(world, familyName));
});

Given(
  /^Ben no longer sees the family drive of "([^"]*)"$/,
  async ({ world }, familyName: string) => {
    const familyId = familyIdNamed(world, familyName);
    await waitForDrives(world.api, sessionOf(world, "Ben"), (listed) =>
      listed.every((drive) => drive.familyId !== familyId),
    );
  },
);

Given(
  /^Anna has a file "([^"]*)" with the content "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, content: string, familyName: string) => {
    const response = await uploadFileAs(
      world.api,
      sessionOf(world, "Anna"),
      await familyDriveIdOf(world, familyName),
      {
        name,
        parentId: null,
        body: content,
      },
    );
    expect(response.status, `Anna has a file ${name} in the family drive`).toBe(201);
  },
);

When(
  /^Anna uploads a new version of "([^"]*)" with the content "([^"]*)"$/,
  async ({ world }, name: string, content: string) => {
    const fileId = await fileIdVisibleTo(world, "Anna", name);
    world.response = await uploadVersionAs(world.api, sessionOf(world, "Anna"), fileId, content);
  },
);

When(
  /^Anna uploads a new version of "([^"]*)" that is larger than the upload limit$/,
  async ({ world }, name: string) => {
    const fileId = await fileIdVisibleTo(world, "Anna", name);
    world.response = await uploadVersionAs(
      world.api,
      sessionOf(world, "Anna"),
      fileId,
      oversizedUploadBody(),
    );
  },
);

When(
  /^Ben looks at the versions of "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const fileId = await familyFileIdOf(world, familyName, name);
    world.response = await listVersionsAs(world.api, sessionOf(world, "Ben"), fileId);
  },
);

When(
  /^Carol looks at the versions of "([^"]*)" in the family drive of "([^"]*)"$/,
  async ({ world }, name: string, familyName: string) => {
    const fileId = await familyFileIdOf(world, familyName, name);
    world.response = await listVersionsAs(world.api, sessionOf(world, "Carol"), fileId);
  },
);

When(/^Anna looks at the versions of "([^"]*)"$/, async ({ world }, name: string) => {
  const fileId = await fileIdVisibleTo(world, "Anna", name);
  world.response = await listVersionsAs(world.api, sessionOf(world, "Anna"), fileId);
});

When(
  /^Anna restores version (\d+) of "([^"]*)"$/,
  async ({ world }, number: string, name: string) => {
    const { fileId, versionId } = await versionIdWithNumber(world, "Anna", name, Number(number));
    world.response = await restoreVersionAs(world.api, sessionOf(world, "Anna"), fileId, versionId);
  },
);

When(
  /^Anna deletes version (\d+) of "([^"]*)"$/,
  async ({ world }, number: string, name: string) => {
    const { fileId, versionId } = await versionIdWithNumber(world, "Anna", name, Number(number));
    world.response = await deleteVersionAs(world.api, sessionOf(world, "Anna"), fileId, versionId);
  },
);

When(/^Anna deletes the current version of "([^"]*)"$/, async ({ world }, name: string) => {
  const fileId = await fileIdVisibleTo(world, "Anna", name);
  const currentId = await currentVersionIdOf(world, "Anna", fileId);
  world.response = await deleteVersionAs(world.api, sessionOf(world, "Anna"), fileId, currentId);
});

Then(
  /^(Anna|Ben) sees (\d+) versions? of "([^"]*)"$/,
  async ({ world }, person: string, count: string, name: string) => {
    await expectVersions(world, person, name, Number(count), false);
  },
);

Then(
  /^(Anna|Ben) sees (\d+) versions? of "([^"]*)" with the newest one current$/,
  async ({ world }, person: string, count: string, name: string) => {
    await expectVersions(world, person, name, Number(count), true);
  },
);

Then(
  /^Anna sees the newest version of "([^"]*)" is version (\d+)$/,
  async ({ world }, name: string, number: string) => {
    const fileId = await fileIdVisibleTo(world, "Anna", name);
    expect(newestNumberOf(await versionsOf(world, "Anna", fileId)), `${name} newest version`).toBe(
      Number(number),
    );
  },
);

Then(
  /^Anna sees the versions of "([^"]*)" listed newest first, version (\d+) before version (\d+)$/,
  async ({ world }, name: string, newer: string, older: string) => {
    const fileId = await fileIdVisibleTo(world, "Anna", name);
    const numbers = numbersOf(await versionsOf(world, "Anna", fileId));
    expect(numbers, "the versions are listed newest first").toEqual(
      [...numbers].sort((first, second) => second - first),
    );
    expect(numbers, "both versions are listed").toEqual(
      expect.arrayContaining([Number(newer), Number(older)]),
    );
    expect(
      numbers.indexOf(Number(newer)),
      `version ${newer} is before version ${older}`,
    ).toBeLessThan(numbers.indexOf(Number(older)));
  },
);

Then(
  /^Anna sees "([^"]*)" with a size of (\d+) bytes$/,
  async ({ world }, name: string, size: string) => {
    expect(await sizeOf(world, "Anna", name), `${name} has the size`).toBe(Number(size));
  },
);

Then("Anna is told the current version of a file cannot be deleted", ({ world }) => {
  const response = responseOf(world);
  expect(response.status, "the current version is refused").toBe(409);
  expect(response.body, "the code names the current version").toMatchObject({
    code: "CURRENT_VERSION",
  });
});

Then("Anna is told the file is too large", ({ world }) => {
  const response = responseOf(world);
  expect(response.status, "Anna is told the file is too large").toBe(413);
  expect(response.body, "Anna is told the file is too large").toMatchObject({
    code: "PAYLOAD_TOO_LARGE",
  });
});

Then("Carol is told the file was not found", ({ world }) => {
  expect(responseOf(world).status, "Carol is told the file was not found").toBe(404);
});

Then("Anna is told a folder has no versions", ({ world }) => {
  const response = responseOf(world);
  expect(response.status, "a folder is refused").toBe(400);
  expect(response.body, "the code names the folder").toMatchObject({ code: "IS_FOLDER" });
});
