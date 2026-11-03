// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { parseArgs } from "node:util";
import { createModuleDb } from "@offgrid/db";
import { Pool } from "pg";
import { CONNECTION_TIMEOUT_MS } from "./constants.js";
import { loadConfigOrExit } from "./config/load-config-or-exit.js";
import { runRecoveryCommand } from "./recovery/run-recovery-command.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    email: { type: "string" },
    name: { type: "string" },
  },
});

const config = loadConfigOrExit();
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: 1,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
});
const db = createModuleDb(pool);

try {
  const issued = await runRecoveryCommand(positionals[0], values, db);
  process.stdout.write(
    `One-time reset code for the admin: ${issued.code}\nValid until ${issued.expiresAt.toISOString()}. Give it to the admin in person; it is shown only once.\n`,
  );
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
  await pool.end();
}
