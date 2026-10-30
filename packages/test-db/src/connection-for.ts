// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget } from "./types.js";

export const connectionFor = (target: DatabaseTarget, schema: string) => ({
  host: target.host,
  port: target.port,
  database: target.database,
  user: `${schema}_app`,
  password: target.password,
});
