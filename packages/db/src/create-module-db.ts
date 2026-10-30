// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Pool } from "pg";
import { PrismaClient } from "../../../node_modules/.prisma/offgrid-db/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

export const createModuleDb = (pool: Pool): PrismaClient =>
  new PrismaClient({ adapter: new PrismaPg(pool) });
