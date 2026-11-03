// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerRuntime } from "../types.js";

export const disconnectModuleDatabases = async (runtime: ServerRuntime): Promise<void> => {
  await Promise.all([...runtime.moduleDatabases.values()].map((db) => db.$disconnect()));
};
