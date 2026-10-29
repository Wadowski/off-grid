// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDescriptor } from "./types.js";

const MODULE_NAME_PATTERN = /^[a-z][a-z0-9]*$/;

export function assertValidModules(modules: readonly ModuleDescriptor[]): void {
  const seen = new Set<string>();
  for (const module of modules) {
    if (!MODULE_NAME_PATTERN.test(module.name)) {
      throw new Error(
        `module name ${JSON.stringify(module.name)} must be lowercase letters and digits`,
      );
    }
    if (seen.has(module.name)) {
      throw new Error(`module "${module.name}" is registered more than once`);
    }
    seen.add(module.name);
  }
}
