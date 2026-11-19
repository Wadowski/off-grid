// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import type { FilesTestDatabase } from "../../../test/types.js";
import { listDrivesFor } from "./list-drives-for.js";

describe("listDrivesFor", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyA = randomUUID();
  const familyB = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query(
      `INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES
         ($1, $2, 1, true), ($3, $4, 1, true)`,
      [familyA, anna, familyB, ben],
    );
  });

  it("lists Anna's personal drive first, then the family drive of her family", async () => {
    const annaPersonal = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const familyDrive = await seedDrive(db.admin, {
      owner: { userId: null, familyId: familyA },
      name: "The Smiths",
    });

    const drives = await listDrivesFor(db.db, anna);

    expect(drives.map((drive) => drive.driveId)).toEqual([annaPersonal, familyDrive]);
    expect(drives.map((drive) => drive.name)).toEqual(["Personal", "The Smiths"]);
  });

  it("does not list Ben's personal drive or the drive of another family", async () => {
    await seedDrive(db.admin, { owner: { userId: anna, familyId: null }, name: "Personal" });
    await seedDrive(db.admin, { owner: { userId: ben, familyId: null }, name: "Personal" });
    await seedDrive(db.admin, { owner: { userId: null, familyId: familyB }, name: "Other" });

    const drives = await listDrivesFor(db.db, anna);

    expect(drives.map((drive) => drive.familyId)).toEqual([null]);
  });

  it("lists no family drive for a former member", async () => {
    await seedDrive(db.admin, { owner: { userId: anna, familyId: null }, name: "Personal" });
    await seedDrive(db.admin, { owner: { userId: null, familyId: familyA }, name: "The Smiths" });
    await db.admin.query(
      "UPDATE files.family_membership SET source_version = 2, is_member = false WHERE family_id = $1 AND user_id = $2",
      [familyA, anna],
    );

    const drives = await listDrivesFor(db.db, anna);

    expect(drives.map((drive) => drive.name)).toEqual(["Personal"]);
  });
});
