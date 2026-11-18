// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileStorage } from "../src/types.js";

export interface StorageFixture {
  readonly storage: FileStorage;
  cleanup(): Promise<void>;
}

export type StorageFixtureFactory = () => Promise<StorageFixture>;
