// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { DB_PACKAGE_DIRECTORY, PRISMA_CLI_PATH } from "./constants.js";
import { databaseUrlOf } from "./database-url-of.js";
import type { DatabaseTarget } from "./types.js";

const execFileAsync = promisify(execFile);

export const migrateDeploy = async (target: DatabaseTarget): Promise<string> => {
  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      [PRISMA_CLI_PATH, "migrate", "deploy"],
      {
        cwd: DB_PACKAGE_DIRECTORY,
        env: { ...process.env, DATABASE_URL: databaseUrlOf(target) },
      },
    );
    return stdout;
  } catch (cause) {
    const stderr = cause instanceof Error && "stderr" in cause ? String(cause.stderr) : "";
    const detail = stderr.replaceAll(target.password, "[redacted]");
    throw new Error(`prisma migrate deploy failed: ${detail}`, { cause });
  }
};
