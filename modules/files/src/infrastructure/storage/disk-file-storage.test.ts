// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { StorageIoError } from "../../application/errors/storage-io-error.js";
import { StorageKeyInvalidError } from "../../application/errors/storage-key-invalid-error.js";
import { describeFileStorageContract } from "../../../test/file-storage-contract.js";
import { listRegularFiles } from "../../../test/list-regular-files.js";
import {
  createStorageRoot,
  createTemporaryDirectory,
  fixtureAt,
} from "../../../test/temp-fixture.js";
import type { StorageFixture } from "../../../test/types.js";
import { createDiskFileStorage } from "./disk-file-storage.js";
import { collectEntries } from "../../../test/collect-entries.js";

const PAYLOAD = Buffer.from("disk payload for the sharded layout", "utf8");
const CHUNK_BYTES = 1024 * 1024;
const HEX_PAIRS = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));

const createDiskFixture = async (): Promise<StorageFixture> => {
  const base = await createTemporaryDirectory();
  const root = await createStorageRoot(base);
  return fixtureAt(base, createDiskFileStorage(root));
};

const tempFolderOf = (root: string): string => join(root, ".tmp");

const tempFolderEntries = async (root: string): Promise<string[]> => readdir(tempFolderOf(root));

const failingAfterFirstChunk = (): Readable => {
  let pushed = false;
  return new Readable({
    read() {
      if (pushed) {
        this.destroy(new Error("source failed"));
        return;
      }
      pushed = true;
      this.push(PAYLOAD);
    },
  });
};

const endlessSource = (onChunk: (count: number) => void): Readable => {
  let count = 0;
  return new Readable({
    read() {
      count += 1;
      onChunk(count);
      this.push(Buffer.alloc(CHUNK_BYTES, count % 251));
    },
  });
};

describeFileStorageContract("disk", createDiskFixture);

describe("disk file storage", () => {
  it("writes the bytes under the sharded key path and leaves the temp folder empty", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const storage = createDiskFileStorage(root);

    const stored = await storage.put(Readable.from([PAYLOAD]));

    const expectedPath = join(root, stored.key.slice(0, 2), stored.key.slice(2, 4), stored.key);
    expect(await readFile(expectedPath)).toEqual(PAYLOAD);
    expect(await listRegularFiles(root)).toEqual([expectedPath]);
    expect(await tempFolderEntries(root)).toEqual([]);
  });

  it("leaves no temp file and no final file when the source fails mid-stream", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const storage = createDiskFileStorage(root);

    await expect(storage.put(failingAfterFirstChunk())).rejects.toThrow("source failed");

    expect(await listRegularFiles(root)).toEqual([]);
    expect(await tempFolderEntries(root)).toEqual([]);
  });

  it("leaves no temp file and no final file when the write is aborted mid-stream", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const storage = createDiskFileStorage(root);
    const controller = new AbortController();

    await expect(
      storage.put(
        endlessSource((count) => {
          if (count === 3) {
            controller.abort();
          }
        }),
        { signal: controller.signal },
      ),
    ).rejects.toThrow();

    expect(await listRegularFiles(root)).toEqual([]);
    expect(await tempFolderEntries(root)).toEqual([]);
  });

  it("removes the temp file and reports a storage error when the final path cannot be created", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    await mkdir(tempFolderOf(root));
    await Promise.all(HEX_PAIRS.map((pair) => writeFile(join(root, pair), "")));
    const storage = createDiskFileStorage(root);

    const failure = await storage.put(Readable.from([PAYLOAD])).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(StorageIoError);
    expect(String(failure)).not.toContain(root);
    expect(await tempFolderEntries(root)).toEqual([]);
    expect(await listRegularFiles(root)).toHaveLength(HEX_PAIRS.length);
  });

  it("never reaches a file beside the storage root through a traversal key", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const victim = join(base, "victim");
    await writeFile(victim, "keep me");
    const storage = createDiskFileStorage(root);

    await expect(storage.delete("../victim")).rejects.toThrow(StorageKeyInvalidError);
    await expect(storage.get("../victim")).rejects.toThrow(StorageKeyInvalidError);
    await expect(storage.exists("../victim")).rejects.toThrow(StorageKeyInvalidError);

    expect(await readFile(victim, "utf8")).toBe("keep me");
  });
  it("listKeys ignores temp files and names that are not storage keys", async () => {
    const base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const storage = createDiskFileStorage(root);
    const stored = await storage.put(Readable.from([PAYLOAD]));
    await mkdir(join(root, ".tmp"), { recursive: true });
    await writeFile(join(root, ".tmp", "partial.part"), "half written");
    await mkdir(join(root, "ab", "cd"), { recursive: true });
    await writeFile(join(root, "ab", "cd", "not-a-key"), "stray");
    await mkdir(join(root, "zz"), { recursive: true });

    const keys = (await collectEntries(storage.listKeys())).map((entry) => entry.key);

    expect(keys).toEqual([stored.key]);
  });
});
