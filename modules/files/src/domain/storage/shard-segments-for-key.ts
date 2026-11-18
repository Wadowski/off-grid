// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STORAGE_SHARD_WIDTH } from "../../constants.js";

export const shardSegmentsForKey = (key: string): readonly [string, string] => [
  key.slice(0, STORAGE_SHARD_WIDTH),
  key.slice(STORAGE_SHARD_WIDTH, STORAGE_SHARD_WIDTH * 2),
];
