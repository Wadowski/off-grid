// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget, DatabaseSchema } from "./types.js";
import { appRoleOf } from "./app-role-of.js";

export const moduleConnectionString = (target: DatabaseTarget, schema: DatabaseSchema): string => {
  const url = new URL(`postgresql://${target.host}:${target.port}/${target.database}`);
  url.username = appRoleOf(schema);
  url.password = target.password;
  return url.toString();
};
