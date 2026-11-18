// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STORAGE_SHARD_ALPHABET, STORAGE_SHARD_WIDTH } from "../../constants.js";

const SHARD_SEGMENT_PATTERN = new RegExp(`^[${STORAGE_SHARD_ALPHABET}]{${STORAGE_SHARD_WIDTH}}$`);

export const isShardSegment = (name: string): boolean => SHARD_SEGMENT_PATTERN.test(name);
