// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Pool } from "pg";
import { POOL_MAX } from "./constants.js";
import { connectionFor } from "./connection-for.js";
import type { DatabaseTarget } from "./types.js";

export const connectPool = (target: DatabaseTarget, pools: Pool[], schema: string): Pool => {
  const pool = new Pool({ ...connectionFor(target, schema), max: POOL_MAX });
  pools.push(pool);
  return pool;
};
