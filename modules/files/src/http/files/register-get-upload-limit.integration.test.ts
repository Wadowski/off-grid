// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import { createInMemoryFileStorage } from "@offgrid/file-storage";
import type { FastifyInstance } from "fastify";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createFilesTestApp } from "../../../test/create-files-test-app.js";
import { startFilesTestDatabase } from "../../../test/start-files-test-database.js";
import type { FilesTestDatabase } from "../../../test/types.js";

const LIMIT_BYTES = 1_048_576;

describe("GET /files/upload-limit", { timeout: 60_000 }, () => {
  let db: FilesTestDatabase;
  let app: FastifyInstance;
  const anna = randomUUID();

  beforeAll(async () => {
    db = await startFilesTestDatabase();
  }, 120_000);

  afterAll(async () => {
    await db.stop();
  }, 120_000);

  beforeEach(async () => {
    await db.reset();
    app = await createFilesTestApp(db, {
      storage: createInMemoryFileStorage(),
      maxUploadBytes: LIMIT_BYTES,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("answers 200 with the configured upload limit in bytes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/files/upload-limit",
      headers: { "x-user-id": anna },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ maxUploadBytes: LIMIT_BYTES });
  });

  it("answers 401 without a signed-in person", async () => {
    const response = await app.inject({ method: "GET", url: "/files/upload-limit" });

    expect(response.statusCode).toBe(401);
  });
});
