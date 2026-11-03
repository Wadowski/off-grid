// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDescriptor, ServerRuntime, Worker } from "../types.js";
import { moduleContextFor } from "./module-context-for.js";

export const registerSubscribersAndCollectWorkers = (
  modules: readonly ModuleDescriptor[],
  runtime: ServerRuntime,
): Worker[] => {
  const workers: Worker[] = [];
  for (const module of modules) {
    const context = moduleContextFor(runtime, module.name);
    module.registerSubscribers?.(context);
    workers.push(...(module.workers?.(context) ?? []));
  }
  return workers;
};
