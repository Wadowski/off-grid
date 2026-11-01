// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createModuleDb, type ModuleDatabase } from "@offgrid/db";
import type { ServerRuntime } from "./types.js";

export const moduleDatabaseFor = (runtime: ServerRuntime, moduleName: string): ModuleDatabase => {
  const existing = runtime.moduleDatabases.get(moduleName);
  if (existing !== undefined) {
    return existing;
  }
  const db = createModuleDb(runtime.pool);
  runtime.moduleDatabases.set(moduleName, db);
  return db;
};
