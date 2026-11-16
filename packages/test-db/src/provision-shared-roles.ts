// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Client } from "pg";
import { APP_ROLE_NAME, MIGRATOR_ROLE_NAME } from "./constants.js";
import { provisionLogin } from "./provision-login.js";
import type { SharedClusterConnection } from "./types.js";

export const provisionSharedRoles = async (
  admin: Client,
  connection: SharedClusterConnection,
): Promise<void> => {
  await admin.query(`CREATE ROLE "${APP_ROLE_NAME}" NOLOGIN`);
  await admin.query(`CREATE ROLE "${MIGRATOR_ROLE_NAME}" NOLOGIN`);
  await provisionLogin(admin, APP_ROLE_NAME, connection.appPassword);
  await provisionLogin(admin, MIGRATOR_ROLE_NAME, connection.migratorPassword);
};
