// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { applyMigrations } from "./apply-migrations.js";
import { provisionLogin } from "./provision-login.js";
import { runInitScripts } from "./run-init-scripts.js";
import type { StartOptions } from "./types.js";

export const provisionDatabase = async (
  admin: Client,
  options: StartOptions,
  password: string,
): Promise<void> => {
  await runInitScripts(admin);
  for (const schema of options.schemas) {
    await provisionLogin(admin, `${schema}_app`, password);
  }
  for (const migration of options.migrations) {
    await applyMigrations(admin, migration.schema, migration.directory);
  }
};
