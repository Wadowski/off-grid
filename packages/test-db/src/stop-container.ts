// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { Client } from "pg";

export const stopContainer = async (
  admin: Client,
  container: StartedPostgreSqlContainer,
): Promise<void> => {
  await admin.end().catch(() => undefined);
  await container.stop({ timeout: 0 });
};
