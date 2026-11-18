// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget, DatabaseTools } from "../types.js";
import { connectionArguments } from "./connection-arguments.js";
import { runPostgresTool } from "./run-postgres-tool.js";

const passwordEnvironment = (target: DatabaseTarget): NodeJS.ProcessEnv => ({
  ...process.env,
  PGPASSWORD: target.password,
});

export const postgresTools: DatabaseTools = {
  dump: (target, dumpFile) =>
    runPostgresTool(
      "pg_dump",
      ["--format=custom", "--file", dumpFile, ...connectionArguments(target)],
      passwordEnvironment(target),
    ),
  listDump: (dumpFile) => runPostgresTool("pg_restore", ["--list", dumpFile], process.env),
  restore: (target, dumpFile) =>
    runPostgresTool(
      "pg_restore",
      ["--clean", "--if-exists", ...connectionArguments(target), dumpFile],
      passwordEnvironment(target),
    ),
};
