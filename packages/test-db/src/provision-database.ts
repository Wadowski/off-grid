// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { APP_ROLE_NAME, MIGRATOR_ROLE_NAME } from "./constants.js";
import { provisionLogin } from "./provision-login.js";
import { runInitScripts } from "./run-init-scripts.js";

export const provisionDatabase = async (
  admin: Client,
  appPassword: string,
  migratorPassword: string,
): Promise<void> => {
  await runInitScripts(admin);
  await provisionLogin(admin, APP_ROLE_NAME, appPassword);
  await provisionLogin(admin, MIGRATOR_ROLE_NAME, migratorPassword);
};
