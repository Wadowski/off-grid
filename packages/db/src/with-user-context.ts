// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingExecutor } from "./types.js";
import { uuid } from "./uuid.js";

export const withUserContext = async (tx: SettingExecutor, userId: string): Promise<void> => {
  await tx.$executeRawUnsafe("SELECT set_config('app.user_id', $1, true)", uuid.parse(userId));
};
