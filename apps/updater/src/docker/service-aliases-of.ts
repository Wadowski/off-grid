// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContainerInspect } from "../types.js";

export const serviceAliasesOf = (source: ContainerInspect, aliases: readonly string[]): string[] =>
  aliases.filter((alias) => !source.Id.startsWith(alias));
