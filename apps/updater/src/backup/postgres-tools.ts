// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget, DatabaseTools } from "../types.js";
import { connectionArguments } from "./connection-arguments.js";
import { runPostgresTool } from "./run-postgres-tool.js";
import { toolEnvironment } from "./tool-environment.js";

// One transaction and stop at the first error: a failed restore leaves the database as it was.
export const restoreArguments = (target: DatabaseTarget, dumpFile: string): string[] => [
  "--clean",
  "--if-exists",
  "--single-transaction",
  "--exit-on-error",
  ...connectionArguments(target),
  dumpFile,
];

export const dumpArguments = (target: DatabaseTarget, dumpFile: string): string[] => [
  "--format=custom",
  "--file",
  dumpFile,
  ...connectionArguments(target),
];

export const postgresTools: DatabaseTools = {
  dump: (target, dumpFile) =>
    runPostgresTool("pg_dump", dumpArguments(target, dumpFile), toolEnvironment(target.password)),
  listDump: (dumpFile) => runPostgresTool("pg_restore", ["--list", dumpFile], toolEnvironment()),
  restore: (target, dumpFile) =>
    runPostgresTool(
      "pg_restore",
      restoreArguments(target, dumpFile),
      toolEnvironment(target.password),
    ),
};
