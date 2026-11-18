// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";
import {
  createStorageRoot,
  createTemporaryDirectory,
  removeDirectory,
} from "../../../test/temp-fixture.js";
import { createDiskFileStorage } from "./disk-file-storage.js";

const MIB = 1024 * 1024;
const STREAM_BYTES = 300 * MIB;
const CHUNK_BYTES = MIB;
const MEMORY_BUDGET_BYTES = 64 * MIB;
const TEST_TIMEOUT_MS = 180_000;

const generatedSource = (referenceHash: ReturnType<typeof createHash>, onChunk: () => void) => {
  let remaining = STREAM_BYTES;
  return new Readable({
    read() {
      if (remaining === 0) {
        this.push(null);
        return;
      }
      const size = Math.min(CHUNK_BYTES, remaining);
      remaining -= size;
      const chunk = Buffer.alloc(size, remaining % 251);
      referenceHash.update(chunk);
      onChunk();
      this.push(chunk);
    },
  });
};

describe("disk file storage memory budget", { timeout: TEST_TIMEOUT_MS }, () => {
  let base: string | undefined;

  afterEach(async () => {
    if (base !== undefined) {
      await removeDirectory(base);
      base = undefined;
    }
  });

  it("writes a 300 MiB stream without holding it in memory", async () => {
    base = await createTemporaryDirectory();
    const root = await createStorageRoot(base);
    const storage = createDiskFileStorage(root);
    const referenceHash = createHash("sha256");
    const baselineRss = process.memoryUsage().rss;
    let peakRss = baselineRss;

    const stored = await storage.put(
      generatedSource(referenceHash, () => {
        peakRss = Math.max(peakRss, process.memoryUsage().rss);
      }),
    );

    expect(stored.sizeBytes).toBe(STREAM_BYTES);
    expect(stored.sha256).toBe(referenceHash.digest("hex"));
    expect(peakRss - baselineRss).toBeLessThan(MEMORY_BUDGET_BYTES);
  });
});
