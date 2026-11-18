// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingExecutor } from "./types.js";

export const withFilesStorageSweepContext = async (tx: SettingExecutor): Promise<void> => {
  await tx.$executeRawUnsafe("SELECT set_config('app.files_storage_sweep', 'on', true)");
};

