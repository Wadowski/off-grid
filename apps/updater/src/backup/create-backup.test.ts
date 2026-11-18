// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BackupFailedError } from "./errors/backup-failed-error.js";
import { createBackup } from "./create-backup.js";
import type { BackupSettings, DatabaseTools } from "../types.js";

const TARGET = {
  host: "db.internal",
  port: 5432,
  database: "offgrid",
  user: "offgrid_migrator",
  password: "migrator-secret-value",
};

const CREATED_AT = new Date("2026-11-17T19:45:00.000Z");
const NAME = "offgrid-1.4.0-20261117T194500Z";

let root: string;
let secretsDirectory: string;
let backupRoot: string;

const workingTools = (): DatabaseTools => ({
  dump: async (_target, dumpFile) => {
    await writeFile(dumpFile, "dump-bytes");
  },
  listDump: async () => undefined,
  restore: async () => undefined,
});

const settings = (retention = 3): BackupSettings => ({
  target: TARGET,
  backupRoot,
  secretsDirectory,
  retention,
});

const modeOf = async (path: string): Promise<number> => (await stat(path)).mode & 0o777;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-backup-"));
  secretsDirectory = join(root, "secrets");
  backupRoot = join(root, "backups");
  await mkdir(secretsDirectory);
  await writeFile(join(secretsDirectory, "migrator-password"), "migrator-secret-value", {
    mode: 0o444,
  });
  await writeFile(join(secretsDirectory, "mail-encryption-key"), "mail-key-value");
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("createBackup", () => {
  it("writes the dump and a secrets copy into a 0700 folder with 0600 secret files", async () => {
    const backup = await createBackup(workingTools(), settings(), {
      version: "1.4.0",
      createdAt: CREATED_AT,
    });

    expect(backup).toEqual({
      name: NAME,
      version: "1.4.0",
      createdAt: CREATED_AT,
      path: join(backupRoot, NAME),
    });
    expect(await modeOf(backupRoot)).toBe(0o700);
    expect(await modeOf(backup.path)).toBe(0o700);
    expect(await readFile(join(backup.path, "database.dump"), "utf8")).toBe("dump-bytes");
    expect(await modeOf(join(backup.path, "secrets"))).toBe(0o700);
    expect(await modeOf(join(backup.path, "secrets", "migrator-password"))).toBe(0o600);
    expect(await readFile(join(backup.path, "secrets", "mail-encryption-key"), "utf8")).toBe(
      "mail-key-value",
    );
  });

  it("passes the target to the dump tool", async () => {
    const received: unknown[] = [];
    const tools: DatabaseTools = {
      ...workingTools(),
      dump: async (target, dumpFile) => {
        received.push(target);
        await writeFile(dumpFile, "dump-bytes");
      },
    };

    await createBackup(tools, settings(), { version: "1.4.0", createdAt: CREATED_AT });

    expect(received).toEqual([TARGET]);
  });

  it("removes the partial folder and prunes nothing when the dump fails", async () => {
    await mkdir(backupRoot, { recursive: true });
    await mkdir(join(backupRoot, "offgrid-1.3.0-20261101T000000Z"));
    await mkdir(join(backupRoot, "offgrid-1.3.1-20261110T000000Z"));
    const failingTools: DatabaseTools = {
      ...workingTools(),
      dump: async (_target, dumpFile) => {
        await writeFile(dumpFile, "partial");
        throw new Error("pg_dump exited with code 1 password=migrator-secret-value");
      },
    };

    const failure = await createBackup(failingTools, settings(1), {
      version: "1.4.0",
      createdAt: CREATED_AT,
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(BackupFailedError);
    expect((failure as BackupFailedError).step).toBe("dump");
    expect((failure as Error).message).not.toContain("migrator-secret-value");
    expect(await readdir(backupRoot)).toEqual([
      "offgrid-1.3.0-20261101T000000Z",
      "offgrid-1.3.1-20261110T000000Z",
    ]);
  });

  it("treats a failed dump verification as a failed backup", async () => {
    const tools: DatabaseTools = {
      ...workingTools(),
      listDump: async () => {
        throw new Error("pg_restore exited with code 1");
      },
    };

    const failure = await createBackup(tools, settings(), {
      version: "1.4.0",
      createdAt: CREATED_AT,
    }).catch((error: unknown) => error);

    expect((failure as BackupFailedError).step).toBe("verify");
    expect(await readdir(backupRoot)).toEqual([]);
  });

  it("treats an empty dump file as a failed verification", async () => {
    const tools: DatabaseTools = {
      ...workingTools(),
      dump: async (_target, dumpFile) => {
        await writeFile(dumpFile, "");
      },
    };

    const failure = await createBackup(tools, settings(), {
      version: "1.4.0",
      createdAt: CREATED_AT,
    }).catch((error: unknown) => error);

    expect((failure as BackupFailedError).step).toBe("verify");
  });

  it("refuses to reuse an existing backup folder and leaves it untouched", async () => {
    await mkdir(join(backupRoot, NAME), { recursive: true });
    await writeFile(join(backupRoot, NAME, "keep.txt"), "earlier backup");

    const failure = await createBackup(workingTools(), settings(), {
      version: "1.4.0",
      createdAt: CREATED_AT,
    }).catch((error: unknown) => error);

    expect((failure as BackupFailedError).step).toBe("prepare");
    expect(await readFile(join(backupRoot, NAME, "keep.txt"), "utf8")).toBe("earlier backup");
  });

  it("prunes older backups beyond the retention after a successful backup", async () => {
    await mkdir(join(backupRoot, "offgrid-1.3.0-20261101T000000Z"), { recursive: true });
    await mkdir(join(backupRoot, "offgrid-1.3.1-20261110T000000Z"), { recursive: true });

    await createBackup(workingTools(), settings(2), { version: "1.4.0", createdAt: CREATED_AT });

    expect(await readdir(backupRoot)).toEqual(["offgrid-1.3.1-20261110T000000Z", NAME]);
  });
});
