// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client.js";
import { type DatabaseSchema, appRoleOf } from "./schemas.js";

export interface DatabaseTarget {
  host: string;
  port: number;
  database: string;
  password: string;
}

/**
 * Connection string for a module's runtime role. The role can only reach its
 * own schema, so the same target with another module's role is refused by
 * Postgres. The password is URL-encoded, so any character is safe.
 */
export function moduleConnectionString(target: DatabaseTarget, schema: DatabaseSchema): string {
  const url = new URL(`postgresql://${target.host}:${target.port}/${target.database}`);
  url.username = appRoleOf(schema);
  url.password = target.password;
  return url.toString();
}

/**
 * Prisma client bound to one module's runtime role. Use it only for that
 * module's own tables; cross-module reads go through projections (ADR 0002).
 */
export function createModuleDb(target: DatabaseTarget, schema: DatabaseSchema): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: moduleConnectionString(target, schema) }),
  });
}
