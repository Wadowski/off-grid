// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StorageKeyInvalidError } from "../src/application/errors/storage-key-invalid-error.js";
import { StorageObjectNotFoundError } from "../src/application/errors/storage-object-not-found-error.js";
import { StorageRangeNotSatisfiableError } from "../src/application/errors/storage-range-not-satisfiable-error.js";
import { generateStorageKey } from "../src/application/storage/generate-storage-key.js";
import { collectEntries } from "./collect-entries.js";
import { collectBytes } from "../src/infrastructure/storage/in-memory/collect-bytes.js";
import type { StorageFixture, StorageFixtureFactory } from "./types.js";

const PAYLOAD = Buffer.from("0123456789abcdefghijklmnopqrstuvwxyz", "utf8");

const INVALID_KEYS = [
  "",
  "../etc/passwd",
  "/etc/passwd",
  "a/b",
  "..",
  "0123456789abcdef0123456789abcdef\0",
  "0123456789ABCDEF0123456789ABCDEF",
  "0123456789abcdef0123456789abcde",
  "0123456789abcdef0123456789abcdef0",
];

const sourceOf = (bytes: Buffer): Readable => Readable.from([bytes]);

const failingSource = (): Readable =>
  new Readable({
    read() {
      this.destroy(new Error("source failed"));
    },
  });

const sha256Of = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

const storedKeyOf = async (fixture: StorageFixture, bytes: Buffer): Promise<string> => {
  const stored = await fixture.storage.put(sourceOf(bytes));
  return stored.key;
};

export const describeFileStorageContract = (
  name: string,
  createFixture: StorageFixtureFactory,
): void => {
  describe(`${name} file storage contract`, () => {
    let fixture: StorageFixture | undefined;

    const current = (): StorageFixture => {
      if (fixture === undefined) {
        throw new Error("storage fixture is not ready");
      }
      return fixture;
    };

    beforeEach(async () => {
      fixture = await createFixture();
    });

    afterEach(async () => {
      await fixture?.cleanup();
      fixture = undefined;
    });

    it("put returns a shaped key, the byte count and the sha256 of the content", async () => {
      const stored = await current().storage.put(sourceOf(PAYLOAD));

      expect(stored).toEqual({
        key: expect.stringMatching(/^[0-9a-f]{32}$/),
        sizeBytes: PAYLOAD.length,
        sha256: sha256Of(PAYLOAD),
      });
    });

    it("get returns exactly the stored bytes", async () => {
      const key = await storedKeyOf(current(), PAYLOAD);

      expect(await collectBytes(await current().storage.get(key), undefined)).toEqual(PAYLOAD);
    });

    it("get returns the first byte, a middle range, the last byte and an open-ended tail", async () => {
      const key = await storedKeyOf(current(), PAYLOAD);
      const read = async (range: { start: number; end?: number }) =>
        (await collectBytes(await current().storage.get(key, range), undefined)).toString("utf8");

      expect(await read({ start: 0, end: 0 })).toBe("0");
      expect(await read({ start: 10, end: 15 })).toBe("abcdef");
      expect(await read({ start: 35, end: 35 })).toBe("z");
      expect(await read({ start: 30 })).toBe("uvwxyz");
    });

    it("get rejects a range that goes beyond the object", async () => {
      const key = await storedKeyOf(current(), PAYLOAD);

      await expect(current().storage.get(key, { start: 36 })).rejects.toThrow(
        StorageRangeNotSatisfiableError,
      );
      await expect(current().storage.get(key, { start: 0, end: 36 })).rejects.toThrow(
        StorageRangeNotSatisfiableError,
      );
    });

    it("get rejects a key that has no stored object", async () => {
      await expect(current().storage.get(generateStorageKey())).rejects.toThrow(
        StorageObjectNotFoundError,
      );
    });

    it("stores and reads an empty object", async () => {
      const stored = await current().storage.put(sourceOf(Buffer.alloc(0)));

      expect(stored.sizeBytes).toBe(0);
      expect(await collectBytes(await current().storage.get(stored.key), undefined)).toEqual(
        Buffer.alloc(0),
      );
    });

    it("exists reports whether bytes are present", async () => {
      const key = await storedKeyOf(current(), PAYLOAD);

      expect(await current().storage.exists(key)).toBe(true);
      expect(await current().storage.exists(generateStorageKey())).toBe(false);
    });

    it("delete removes the bytes, and deleting a missing key is not an error", async () => {
      const key = await storedKeyOf(current(), PAYLOAD);

      await current().storage.delete(key);
      expect(await current().storage.exists(key)).toBe(false);
      await expect(current().storage.delete(key)).resolves.toBeUndefined();
      await expect(current().storage.delete(generateStorageKey())).resolves.toBeUndefined();
    });

    it.each(INVALID_KEYS)(
      "rejects the key %j before reading, checking or deleting",
      async (key) => {
        await expect(current().storage.get(key)).rejects.toThrow(StorageKeyInvalidError);
        await expect(current().storage.exists(key)).rejects.toThrow(StorageKeyInvalidError);
        await expect(current().storage.delete(key)).rejects.toThrow(StorageKeyInvalidError);
      },
    );

    it("listKeys is empty when nothing is stored", async () => {
      expect(await collectEntries(current().storage.listKeys())).toEqual([]);
    });

    it("listKeys yields every stored object with its modified time", async () => {
      const first = await current().storage.put(sourceOf(PAYLOAD));
      const second = await current().storage.put(sourceOf(Buffer.from("second")));

      const entries = await collectEntries(current().storage.listKeys());

      expect(entries.map((entry) => entry.key).sort()).toEqual([first.key, second.key].sort());
      for (const entry of entries) {
        expect(entry.modifiedAt).toBeInstanceOf(Date);
        expect(Number.isNaN(entry.modifiedAt.getTime())).toBe(false);
      }
    });

    it("listKeys leaves out an object that was deleted", async () => {
      const kept = await current().storage.put(sourceOf(PAYLOAD));
      const removed = await current().storage.put(sourceOf(Buffer.from("gone")));
      await current().storage.delete(removed.key);

      const keys = (await collectEntries(current().storage.listKeys())).map((entry) => entry.key);

      expect(keys).toEqual([kept.key]);
    });

    it("put rejects a source that fails", async () => {
      await expect(current().storage.put(failingSource())).rejects.toThrow("source failed");
    });

    it("put rejects when the signal is already aborted", async () => {
      const controller = new AbortController();
      controller.abort();

      await expect(
        current().storage.put(sourceOf(PAYLOAD), { signal: controller.signal }),
      ).rejects.toThrow();
    });
  });
};
