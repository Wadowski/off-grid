// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDescriptor } from "./types.js";
import { loadMigrations, type Migration } from "@offgrid/db";

export const loadExpectedMigrations = async (
  modules: readonly ModuleDescriptor[],
): Promise<Migration[]> => {
  const sources = modules.flatMap((module) => module.migrations ?? []);
  return (await Promise.all(sources.map((source) => loadMigrations(source)))).flat();
};
