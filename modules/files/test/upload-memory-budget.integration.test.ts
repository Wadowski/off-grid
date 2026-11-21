// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { createDiskFileStorage } from "@offgrid/file-storage";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { uploadFile } from "../src/application/files/upload-file.js";
import { startFilesTestDatabase } from "./start-files-test-database.js";
import { seedDrive } from "./seed-drive.js";
import type { FilesTestDatabase } from "./types.js";

const MIB = 1024 * 1024;
const UPLOAD_BYTES = 512 * MIB;
const CHUNK_BYTES = MIB;
const MEMORY_BUDGET_BYTES = 64 * MIB;
const TEST_TIMEOUT_MS = 300_000;

const generatedBody = (onChunk: () => void): Readable => {
  let remaining = UPLOAD_BYTES;
  return new Readable({
    read() {
      if (remaining === 0) {
        this.push(null);
        return;
      }
      const size = Math.min(CHUNK_BYTES, remaining);
      remaining -= size;
      onChunk();
      this.push(Buffer.alloc(size, remaining % 251));
    },
  });
};

describe("streamed upload memory budget", { timeout: TEST_TIMEOUT_MS }, () => {
  let db: FilesTestDatabase;
  let directory: string | undefined;
  const anna = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
  });

  afterEach(async () => {
    if (directory !== undefined) {
      await rm(directory, { recursive: true, force: true });
      directory = undefined;
    }
  });

  it("keeps the heap growth of a 512 MiB upload under the budget and stores every byte", async () => {
    directory = await mkdtemp(join(tmpdir(), "offgrid-upload-budget-"));
    const storage = createDiskFileStorage(directory);
    const driveId = await seedDrive(db.admin, {
      owner: { userId: anna, familyId: null },
      name: "Personal",
    });
    const baselineHeap = process.memoryUsage().heapUsed;
    let peakHeap = baselineHeap;

    const result = await uploadFile({ db: db.db, storage, maxUploadBytes: UPLOAD_BYTES }, anna, {
      driveId,
      parentId: null,
      name: "Large.bin",
      mimeType: "application/octet-stream",
      body: generatedBody(() => {
        peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);
      }),
      signal: new AbortController().signal,
    });

    expect(result).toEqual({
      outcome: "found",
      value: expect.objectContaining({ name: "Large.bin", version: 1 }),
    });
    const { rows } = await db.admin.query<{ size_bytes: string }>(
      "SELECT size_bytes FROM files.file_version",
    );
    expect(rows).toEqual([{ size_bytes: String(UPLOAD_BYTES) }]);
    expect(peakHeap - baselineHeap).toBeLessThan(MEMORY_BUDGET_BYTES);
  });
});
