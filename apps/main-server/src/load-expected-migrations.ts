// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { loadMigrations, type Migration, type MigrationSource } from "@offgrid/db";

export const loadExpectedMigrations = async (
  sources: readonly MigrationSource[],
): Promise<Migration[]> => {
  return (await Promise.all(sources.map((source) => loadMigrations(source)))).flat();
};
