// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { DatabaseTarget } from "./types.js";

export const buildTarget = (
  container: StartedPostgreSqlContainer,
  password: string,
): DatabaseTarget => ({
  host: container.getHost(),
  port: container.getPort(),
  database: container.getDatabase(),
  password,
});
