// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { runWithSharedDatabase } from "./run-with-shared-database-task.js";

const [command, ...args] = process.argv.slice(2);
if (command === undefined) {
  throw new Error("Usage: run-with-shared-database <command> [arguments]");
}
process.exitCode = await runWithSharedDatabase(command, args);
