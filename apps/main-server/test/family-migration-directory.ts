// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";

export const FAMILY_MIGRATION_DIRECTORY = fileURLToPath(
  new URL("../../../packages/db/test/fixtures/migrations/family", import.meta.url),
);
