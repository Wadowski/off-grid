// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { StorageFixture } from "./types.js";
import { removeDirectory } from "./remove-directory.js";

export const fixtureAt = (base: string, storage: StorageFixture["storage"]): StorageFixture => ({
  storage,
  cleanup: () => removeDirectory(base),
});
