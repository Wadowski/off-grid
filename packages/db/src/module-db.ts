// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../node_modules/.prisma/offgrid-db/client.js";
import { type DatabaseSchema, appRoleOf } from "./schemas.js";

export interface DatabaseTarget {
  host: string;
  port: number;
  database: string;
  password: string;
}

export function moduleConnectionString(target: DatabaseTarget, schema: DatabaseSchema): string {
  const url = new URL(`postgresql://${target.host}:${target.port}/${target.database}`);
  url.username = appRoleOf(schema);
  url.password = target.password;
  return url.toString();
}

export function createModuleDb(target: DatabaseTarget, schema: DatabaseSchema): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: moduleConnectionString(target, schema) }),
  });
}
