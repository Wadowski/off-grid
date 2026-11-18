// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postgresTools } from "./postgres-tools.js";

const TARGET = {
  host: "db.internal",
  port: 5432,
  database: "offgrid",
  user: "offgrid_migrator",
  password: "migrator-secret-value",
};

let root: string;
let argsFile: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-postgres-tools-"));
  argsFile = join(root, "args.txt");
  await writeFile(join(root, "pg_restore"), `#!/bin/sh\nprintf '%s\\n' "$@" > "${argsFile}"\n`, {
    mode: 0o755,
  });
  await chmod(join(root, "pg_restore"), 0o755);
  vi.stubEnv("PATH", `${root}:${process.env.PATH ?? ""}`);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(root, { recursive: true, force: true });
});

describe("postgresTools.restore", () => {
  it("restores in one transaction, stops on the first error, and cleans first", async () => {
    await postgresTools.restore(TARGET, "/backups/x/database.dump");

    expect((await readFile(argsFile, "utf8")).trimEnd().split("\n")).toEqual([
      "--clean",
      "--if-exists",
      "--single-transaction",
      "--exit-on-error",
      "--host",
      "db.internal",
      "--port",
      "5432",
      "--username",
      "offgrid_migrator",
      "--dbname",
      "offgrid",
      "/backups/x/database.dump",
    ]);
  });

  it("never puts the password on the command line", async () => {
    await postgresTools.restore(TARGET, "/backups/x/database.dump");

    expect(await readFile(argsFile, "utf8")).not.toContain("migrator-secret-value");
  });
});
