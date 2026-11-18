// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, mkdtemp, readdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySecrets } from "./copy-secrets.js";
import { SecretFileUnreadableError } from "./errors/secret-file-unreadable-error.js";

let root: string;
let secretsDirectory: string;
let destination: string;

const modeOf = async (path: string): Promise<number> => (await stat(path)).mode & 0o777;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "offgrid-copy-secrets-"));
  secretsDirectory = join(root, "secrets");
  destination = join(root, "backup", "secrets");
  await mkdir(join(root, "backup"));
  await mkdir(secretsDirectory);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("copySecrets", () => {
  it("copies a regular secret file with mode 0600 and the same contents", async () => {
    await writeFile(join(secretsDirectory, "mail-encryption-key"), "mail-key-value", {
      mode: 0o644,
    });

    await copySecrets(secretsDirectory, destination);

    expect(await modeOf(destination)).toBe(0o700);
    expect(await modeOf(join(destination, "mail-encryption-key"))).toBe(0o600);
    expect(await readFile(join(destination, "mail-encryption-key"), "utf8")).toBe("mail-key-value");
  });

  it("copies a secret that is a symlink to a file, with the file's contents", async () => {
    const real = join(root, "elsewhere-key");
    await writeFile(real, "linked-key-value");
    await symlink(real, join(secretsDirectory, "linked-key"));

    await copySecrets(secretsDirectory, destination);

    expect(await readFile(join(destination, "linked-key"), "utf8")).toBe("linked-key-value");
    expect(await modeOf(join(destination, "linked-key"))).toBe(0o600);
  });

  it("fails with a named error for a dangling symlink instead of skipping it", async () => {
    await symlink(join(root, "missing"), join(secretsDirectory, "dangling-key"));

    const failure = await copySecrets(secretsDirectory, destination).catch(
      (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(SecretFileUnreadableError);
    expect((failure as SecretFileUnreadableError).fileName).toBe("dangling-key");
  });

  it("skips subdirectories of the secrets directory", async () => {
    await mkdir(join(secretsDirectory, "nested"));
    await writeFile(join(secretsDirectory, "migrator-password"), "migrator-secret-value");

    await copySecrets(secretsDirectory, destination);

    expect(await readdir(destination)).toEqual(["migrator-password"]);
  });
});
