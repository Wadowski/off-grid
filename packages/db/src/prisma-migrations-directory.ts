// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";

export const PRISMA_MIGRATIONS_DIRECTORY = fileURLToPath(
  new URL("../prisma/migrations", import.meta.url),
);
