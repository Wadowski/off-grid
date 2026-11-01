// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { DatabaseTarget } from "./types.js";

export const targetOf = (
  container: StartedPostgreSqlContainer,
  user: string,
  password: string,
): DatabaseTarget => ({
  host: container.getHost(),
  port: container.getPort(),
  database: container.getDatabase(),
  user,
  password,
});
