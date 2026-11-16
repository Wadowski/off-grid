// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget, SharedClusterConnection } from "./types.js";

export const sharedTargetOf = (
  connection: SharedClusterConnection,
  database: string,
  user: string,
  password: string,
): DatabaseTarget => ({
  host: connection.host,
  port: connection.port,
  database,
  user,
  password,
});
