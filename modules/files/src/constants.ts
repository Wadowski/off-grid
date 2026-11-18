// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const STORAGE_KEY_PATTERN = /^[0-9a-f]{32}$/;
export const STORAGE_SHARD_WIDTH = 2;
export const STORAGE_KEY_GENERATION_ATTEMPTS = 3;
export const STORAGE_TEMP_DIRECTORY_NAME = ".tmp";
export const STORAGE_SWEEP_GRACE_MS = 60 * 60 * 1000;
export const STORAGE_SWEEP_BATCH_SIZE = 1000;
export const STORAGE_SWEEP_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const STORAGE_SWEEP_FIRST_RUN_DELAY_MS = 60 * 1000;
