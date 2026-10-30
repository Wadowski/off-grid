// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MigrationSource, DatabaseSchema } from "../src/index.js";
import { FIXTURES } from "./fixtures.js";

export const fixtureSources = (): MigrationSource[] => {
  return (["food", "family", "access", "lists"] as const satisfies DatabaseSchema[]).map(
    (schema) => ({ schema, directory: `${FIXTURES}/${schema}` }),
  );
};
