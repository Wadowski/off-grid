// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { kebabCase } from "./kebab-case.js";

export const declarations = (prefix: string, values: Readonly<Record<string, string>>): string => {
  return Object.entries(values)
    .map(([name, value]) => `--og-${prefix}-${kebabCase(name)}: ${value};`)
    .join(" ");
};
