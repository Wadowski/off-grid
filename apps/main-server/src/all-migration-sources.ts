// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MigrationSource } from "@offgrid/db";
import { EVENT_BUS_MIGRATIONS } from "./constants.js";
import type { ModuleDescriptor } from "./types.js";

export const allMigrationSources = (modules: readonly ModuleDescriptor[]): MigrationSource[] => [
  ...EVENT_BUS_MIGRATIONS,
  ...modules.flatMap((module) => module.migrations ?? []),
];
