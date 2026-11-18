// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const UPDATER_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PROCESS_TIMEOUT_MILLISECONDS = 30000;
const directory = mkdtempSync(join(tmpdir(), "offgrid-updater-main-"));
const passwordFile = join(directory, "migrator-password");
writeFileSync(passwordFile, "migrator-test-value\n");

const runMain = (env: Record<string, string>) =>
  spawnSync(process.execPath, ["--import", "tsx", "src/main.ts"], {
    cwd: UPDATER_ROOT,
    env: { PATH: process.env.PATH ?? "", ...env },
    encoding: "utf8",
    timeout: PROCESS_TIMEOUT_MILLISECONDS,
  });

describe("updater process start", () => {
  afterAll(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it(
    "exits non-zero and names OFFGRID_UPDATER_TOKEN_FILE when the token file is not configured",
    () => {
      const result = runMain({
        OFFGRID_UPDATER_DATABASE_HOST: "db.internal",
        OFFGRID_UPDATER_MIGRATOR_PASSWORD_FILE: passwordFile,
        OFFGRID_UPDATER_RELEASE_REPOSITORY: "owner/offgrid",
      });

      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("OFFGRID_UPDATER_TOKEN_FILE");
    },
    PROCESS_TIMEOUT_MILLISECONDS,
  );
});
