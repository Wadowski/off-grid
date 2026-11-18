// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTools } from "../types.js";
import { connectionArguments } from "./connection-arguments.js";
import { runPostgresTool } from "./run-postgres-tool.js";
import { toolEnvironment } from "./tool-environment.js";

export const postgresTools: DatabaseTools = {
  dump: (target, dumpFile) =>
    runPostgresTool(
      "pg_dump",
      ["--format=custom", "--file", dumpFile, ...connectionArguments(target)],
      toolEnvironment(target.password),
    ),
  listDump: (dumpFile) => runPostgresTool("pg_restore", ["--list", dumpFile], toolEnvironment()),
  restore: (target, dumpFile) =>
    runPostgresTool(
      "pg_restore",
      ["--clean", "--if-exists", ...connectionArguments(target), dumpFile],
      toolEnvironment(target.password),
    ),
};
