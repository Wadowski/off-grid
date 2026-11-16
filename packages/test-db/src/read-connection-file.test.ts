// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SHARED_DATABASE_FILE_ENV } from "./constants.js";
import { readConnectionFile } from "./read-connection-file.js";

const validConnection = {
  host: "127.0.0.1",
  port: 49152,
  maintenanceDatabase: "test",
  adminUser: "test",
  adminPassword: "admin-secret-value",
  appPassword: "app-secret-value",
  migratorPassword: "migrator-secret-value",
};

describe("readConnectionFile", () => {
  let directory: string;
  let previous: string | undefined;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "offgrid-test-db-read-"));
    previous = process.env[SHARED_DATABASE_FILE_ENV];
  });

  afterEach(async () => {
    if (previous === undefined) {
      delete process.env[SHARED_DATABASE_FILE_ENV];
    } else {
      process.env[SHARED_DATABASE_FILE_ENV] = previous;
    }
    await rm(directory, { recursive: true, force: true });
  });

  const writeConnection = async (contents: string): Promise<void> => {
    const path = join(directory, "connection.json");
    await writeFile(path, contents);
    process.env[SHARED_DATABASE_FILE_ENV] = path;
  };

  it("returns undefined when the variable is unset", async () => {
    delete process.env[SHARED_DATABASE_FILE_ENV];
    await expect(readConnectionFile()).resolves.toBeUndefined();
  });

  it("parses a valid connection file", async () => {
    await writeConnection(JSON.stringify(validConnection));
    await expect(readConnectionFile()).resolves.toEqual(validConnection);
  });

  it("names the missing fields without echoing any value", async () => {
    await writeConnection(JSON.stringify({ ...validConnection, appPassword: undefined }));
    const failure = readConnectionFile();
    await expect(failure).rejects.toThrow("fields: appPassword");
    await expect(failure).rejects.not.toThrow("admin-secret-value");
  });

  it("refuses malformed JSON without echoing its contents", async () => {
    await writeConnection('{"adminPassword": "admin-secret-value",');
    const failure = readConnectionFile();
    await expect(failure).rejects.toThrow("is not valid JSON");
    await expect(failure).rejects.not.toThrow("admin-secret-value");
  });
});
