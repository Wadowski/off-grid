// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { basename, dirname } from "node:path";

export const shardPrefixOf = (shardPath: string): string =>
  `${basename(dirname(shardPath))}${basename(shardPath)}`;
