// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget, DatabaseSchema } from "./types.js";
import { PrismaClient } from "../../../node_modules/.prisma/offgrid-db/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { moduleConnectionString } from "./module-connection-string.js";

export const createModuleDb = (target: DatabaseTarget, schema: DatabaseSchema): PrismaClient => {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: moduleConnectionString(target, schema) }),
  });
};
