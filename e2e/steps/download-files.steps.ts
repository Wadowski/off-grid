// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import {
  downloadAs,
  findItemAcrossDrives,
  listDrivesAs,
  listItemsAs,
  listVersionsAs,
  uploadFileAs,
  waitForDrives,
} from "../support/factories/files.js";
import type { Session } from "../support/factories/instance-admin.js";
import { signedInPerson } from "../support/factories/notifications.js";
import type { DownloadResponse, FileVersionEntry } from "../support/factories/types.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const sessionOf = (world: ScenarioWorld, name: string): Session => {
  const person = world.people?.[name];
  if (person === undefined) {
    throw new Error(`${name} has not signed up`);
  }
  return person.session;
};

const personalDriveIdOfAnna = async (world: ScenarioWorld): Promise<string> => {
  const drives = await waitForDrives(world.api, sessionOf(world, "Anna"), (listed) =>
    listed.some((drive) => drive.familyId === null),
  );
  return drives.find((drive) => drive.familyId === null)?.id ?? "";
};

const fileIdNamed = async (world: ScenarioWorld, name: string): Promise<string> =>
  (await findItemAcrossDrives(world.api, sessionOf(world, "Anna"), name)).id;

const familyFileIdNamed = async (
  world: ScenarioWorld,
  familyName: string,
  name: string,
): Promise<string> => {
  const family = world.families.find((created) => created.name === familyName);
  const drives = await listDrivesAs(world.api, sessionOf(world, "Anna"));
  const drive = drives.find((listed) => listed.familyId === family?.id);
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

const downloadOf = (world: ScenarioWorld): DownloadResponse => {
  if (world.download === undefined) {
    throw new Error("No download was made");
  }
  return world.download;
};

const bodyCodeOf = (response: DownloadResponse): string | undefined =>
  (JSON.parse(response.body) as { code?: string }).code;

Given(/^a new person Carl signs up$/, async ({ world }) => {
  world.people = { ...world.people, Carl: await signedInPerson(world.api, "Carl") };
});

Given(
  /^Anna has an HTML page "([^"]*)" with the content "([^"]*)" in her personal drive$/,
  async ({ world }, name: string, content: string) => {
    const response = await uploadFileAs(
      world.api,
      sessionOf(world, "Anna"),
      await personalDriveIdOfAnna(world),
      { name, parentId: null, body: content, contentType: "text/html" },
    );
    expect(response.status, `Anna has the page ${name}`).toBe(201);
  },
);

Given(/^Anna has a PNG image "([^"]*)" in her personal drive$/, async ({ world }, name: string) => {
  const response = await uploadFileAs(
    world.api,
    sessionOf(world, "Anna"),
    await personalDriveIdOfAnna(world),
    { name, parentId: null, body: "png image", contentType: "image/png" },
  );
  expect(response.status, `Anna has the image ${name}`).toBe(201);
});

When(
  /^(Anna|Ben|Carl) downloads the content of "([^"]*)"$/,
  async ({ world }, person: string, name: string) => {
    world.download = await downloadAs(
      world.api,
      sessionOf(world, person),
      `/api/files/${await fileIdNamed(world, name)}/content`,
    );
  },
);

When(
  /^(Anna|Ben|Carl) downloads the content of "([^"]*)" from the family drive of "([^"]*)"$/,
  async ({ world }, person: string, name: string, familyName: string) => {
    world.download = await downloadAs(
      world.api,
      sessionOf(world, person),
      `/api/files/${await familyFileIdNamed(world, familyName, name)}/content`,
    );
  },
);

When(
  /^Anna downloads version (\d+) of "([^"]*)"$/,
  async ({ world }, number: string, name: string) => {
    const fileId = await fileIdNamed(world, name);
    const listed = await listVersionsAs(world.api, sessionOf(world, "Anna"), fileId);
    const versions = (listed.body as { versions: FileVersionEntry[] }).versions;
    const version = versions.find((listedVersion) => listedVersion.number === Number(number));
    if (version === undefined) {
      throw new Error(`${name} has no version ${number}`);
    }
    world.download = await downloadAs(
      world.api,
      sessionOf(world, "Anna"),
      `/api/files/${fileId}/versions/${version.id}/content`,
    );
  },
);

When(
  /^Anna downloads bytes (\d+) to (\d+) of "([^"]*)"$/,
  async ({ world }, start: string, end: string, name: string) => {
    world.download = await downloadAs(
      world.api,
      sessionOf(world, "Anna"),
      `/api/files/${await fileIdNamed(world, name)}/content`,
      { range: `bytes=${start}-${end}` },
    );
  },
);

When(/^Anna asks to show "([^"]*)" inline$/, async ({ world }, name: string) => {
  world.download = await downloadAs(
    world.api,
    sessionOf(world, "Anna"),
    `/api/files/${await fileIdNamed(world, name)}/content?disposition=inline`,
  );
});

Then(
  /^(Anna|Ben) gets the content "([^"]*)" as a download of "([^"]*)"$/,
  ({ world }, _person: string, content: string, name: string) => {
    const response = downloadOf(world);
    expect(response.status, "the download succeeds").toBe(200);
    expect(response.body, "the bytes are the file's content").toBe(content);
    expect(response.headers["content-disposition"]).toBe(
      `attachment; filename="${name}"; filename*=UTF-8''${name}`,
    );
  },
);

Then(/^Carl sees that the file is not found$/, ({ world }) => {
  const response = downloadOf(world);
  expect(response.status).toBe(404);
  expect(bodyCodeOf(response)).toBe("NOT_FOUND");
});

Then(/^Anna gets the content "([^"]*)" for the range of "[^"]*"$/, ({ world }, content: string) => {
  const response = downloadOf(world);
  expect(response.status, "the range is answered as partial content").toBe(206);
  expect(response.body).toBe(content);
});

Then(
  /^Anna is told the range cannot be satisfied for "([^"]*)" of (\d+) bytes$/,
  ({ world }, _name: string, size: string) => {
    const response = downloadOf(world);
    expect(response.status).toBe(416);
    expect(response.headers["content-range"]).toBe(`bytes */${size}`);
  },
);

Then(
  /^Anna gets "([^"]*)" as an attachment with the type ([^\s]+)$/,
  ({ world }, _name: string, mediaType: string) => {
    const response = downloadOf(world);
    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toMatch(/^attachment;/);
    expect(response.headers["content-type"]).toBe(mediaType);
  },
);

Then(
  /^Anna gets "([^"]*)" to show inline as ([^\s]+)$/,
  ({ world }, _name: string, mediaType: string) => {
    const response = downloadOf(world);
    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toMatch(/^inline;/);
    expect(response.headers["content-type"]).toBe(mediaType);
  },
);

Then(/^Anna is told that a folder has no content to download$/, ({ world }) => {
  const response = downloadOf(world);
  expect(response.status).toBe(400);
  expect(bodyCodeOf(response)).toBe("IS_FOLDER");
});
