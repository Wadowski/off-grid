// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { createInMemoryFileStorage, type FileStorage } from "@offgrid/file-storage";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import { seedDrive } from "../../../test/seed-drive.js";
import { seedFolder } from "../../../test/seed-folder.js";
import type { FilesTestDatabase, SeedOwner } from "../../../test/types.js";
import { UploadTooLargeError } from "../errors/upload-too-large-error.js";
import { NameTakenError } from "../errors/name-taken-error.js";
import { uploadFile } from "./upload-file.js";

const MAX_UPLOAD_BYTES = 1024;

describe("uploadFile", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  const familyId = randomUUID();
  const anna = randomUUID();
  const ben = randomUUID();
  const annaOwner: SeedOwner = { userId: anna, familyId: null };
  const familyOwner: SeedOwner = { userId: null, familyId };
  let storage: FileStorage;

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    await db.admin.query("TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter");
    storage = createInMemoryFileStorage();
    await db.admin.query(
      "INSERT INTO files.family_membership (family_id, user_id, source_version, is_member) VALUES ($1, $2, 1, true)",
      [familyId, anna],
    );
  });

  const bodyOf = (...chunks: string[]): AsyncIterable<Uint8Array> =>
    Readable.from(chunks.map((chunk) => Buffer.from(chunk)));

  const upload = (
    userId: string,
    driveId: string,
    name: string,
    body: AsyncIterable<Uint8Array>,
    parentId: string | null = null,
  ) =>
    uploadFile(
      { db: db.db, storage, maxUploadBytes: MAX_UPLOAD_BYTES },
      userId,
      {
        driveId,
        parentId,
        name,
        mimeType: "text/plain",
        body,
        signal: new AbortController().signal,
      },
    );

  const storedKeys = async (): Promise<string[]> => {
    const keys: string[] = [];
    for await (const entry of storage.listKeys()) {
      keys.push(entry.key);
    }
    return keys;
  };

  const fileRows = async () => {
    const { rows } = await db.admin.query<{ name: string; size_bytes: string; version: number }>(
      "SELECT f.name, f.size_bytes, f.version FROM files.file f ORDER BY f.name",
    );
    return rows;
  };

  const versionRows = async () => {
    const { rows } = await db.admin.query<{ number: number; storage_key: string; sha256: string }>(
      "SELECT number, storage_key, sha256 FROM files.file_version",
    );
    return rows;
  };

  it("stores the bytes, writes the file and its first version, and publishes one created event", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const content = "Holiday notes";

    const result = await upload(anna, driveId, "Holiday.txt", bodyOf(content));

    expect(result).toEqual({
      outcome: "found",
      value: expect.objectContaining({ name: "Holiday.txt", isFolder: false, version: 1 }),
    });
    const keys = await storedKeys();
    expect(keys).toHaveLength(1);
    const [version] = await versionRows();
    expect(version).toMatchObject({
      number: 1,
      storage_key: keys[0],
      sha256: createHash("sha256").update(content).digest("hex"),
    });
    expect(await fileRows()).toEqual([
      { name: "Holiday.txt", size_bytes: String(content.length), version: 1 },
    ]);
    const { rows: events } = await db.admin.query<{ payload: unknown }>(
      "SELECT payload FROM outbox.event WHERE type = 'file-created-v1'",
    );
    expect(events).toHaveLength(1);
    const serializedEvent = JSON.stringify(events[0]?.payload);
    expect(serializedEvent).not.toContain(keys[0]);
    expect(serializedEvent).not.toContain(version?.sha256 ?? "");
  });

  it("uploads into a folder of the family drive for a member", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: familyOwner,
      parentId: null,
      name: "Photos",
    });

    const result = await upload(anna, driveId, "Beach.jpg", bodyOf("pixels"), folderId);

    expect(result).toEqual({
      outcome: "found",
      value: expect.objectContaining({ name: "Beach.jpg", parentId: folderId }),
    });
  });

  it("stores an empty body as an empty file", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });

    const result = await upload(anna, driveId, "Empty.txt", bodyOf());

    expect(result.outcome).toBe("found");
    expect(await fileRows()).toEqual([{ name: "Empty.txt", size_bytes: "0", version: 1 }]);
    expect(await storedKeys()).toHaveLength(1);
  });

  it("answers not-found for a person who cannot see the drive, and stores no bytes", async () => {
    const driveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });

    const result = await upload(ben, driveId, "Secret.txt", bodyOf("secret"));

    expect(result).toEqual({ outcome: "not-found" });
    expect(await storedKeys()).toEqual([]);
    expect(await fileRows()).toEqual([]);
  });

  it("answers not-found for a parent folder in another drive, and stores no bytes", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const otherDriveId = await seedDrive(db.admin, { owner: familyOwner, name: "The Smiths" });
    const foreignFolder = await seedFolder(db.admin, {
      driveId: otherDriveId,
      owner: familyOwner,
      parentId: null,
      name: "Photos",
    });

    const result = await upload(anna, driveId, "Beach.jpg", bodyOf("pixels"), foreignFolder);

    expect(result).toEqual({ outcome: "not-found" });
    expect(await storedKeys()).toEqual([]);
  });

  it("refuses a taken name before any bytes are stored", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    await upload(anna, driveId, "Holiday.txt", bodyOf("first"));

    await expect(upload(anna, driveId, "holiday.TXT", bodyOf("second"))).rejects.toBeInstanceOf(
      NameTakenError,
    );
    expect(await storedKeys()).toHaveLength(1);
    expect(await fileRows()).toHaveLength(1);
  });

  it("stops at the limit for a body without a declared length, and leaves no bytes or rows", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const oversized = "x".repeat(MAX_UPLOAD_BYTES + 1);

    await expect(upload(anna, driveId, "Big.txt", bodyOf(oversized))).rejects.toBeInstanceOf(
      UploadTooLargeError,
    );
    expect(await storedKeys()).toEqual([]);
    expect(await fileRows()).toEqual([]);
  });

  it("accepts a body of exactly the limit", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });

    const result = await upload(
      anna,
      driveId,
      "Exact.txt",
      bodyOf("x".repeat(MAX_UPLOAD_BYTES)),
    );

    expect(result.outcome).toBe("found");
  });

  it("removes the bytes when the parent folder is trashed while the bytes are stored", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const folderId = await seedFolder(db.admin, {
      driveId,
      owner: annaOwner,
      parentId: null,
      name: "Photos",
    });
    const trashingStorage: FileStorage = {
      ...storage,
      put: async (source, options) => {
        const stored = await storage.put(source, options);
        await db.admin.query("UPDATE files.file SET deleted_at = now() WHERE file_id = $1", [
          folderId,
        ]);
        return stored;
      },
    };

    const result = await uploadFile(
      { db: db.db, storage: trashingStorage, maxUploadBytes: MAX_UPLOAD_BYTES },
      anna,
      {
        driveId,
        parentId: folderId,
        name: "Beach.jpg",
        mimeType: "image/jpeg",
        body: bodyOf("pixels"),
        signal: new AbortController().signal,
      },
    );

    expect(result).toEqual({ outcome: "not-found" });
    expect(await storedKeys()).toEqual([]);
    expect(await versionRows()).toEqual([]);
  });

  it("removes the bytes when a same-name file appears while the bytes are stored", async () => {
    const driveId = await seedDrive(db.admin, { owner: annaOwner, name: "Personal" });
    const racingStorage: FileStorage = {
      ...storage,
      put: async (source, options) => {
        const stored = await storage.put(source, options);
        await db.admin.query(
          "INSERT INTO files.file (file_id, drive_id, user_id, name, is_folder, version) VALUES ($1, $2, $3, 'Race.txt', true, 1)",
          [randomUUID(), driveId, anna],
        );
        return stored;
      },
    };

    await expect(
      uploadFile(
        { db: db.db, storage: racingStorage, maxUploadBytes: MAX_UPLOAD_BYTES },
        anna,
        {
          driveId,
          parentId: null,
          name: "Race.txt",
          mimeType: "text/plain",
          body: bodyOf("late"),
          signal: new AbortController().signal,
        },
      ),
    ).rejects.toBeInstanceOf(NameTakenError);
    expect(await storedKeys()).toEqual([]);
  });
});
