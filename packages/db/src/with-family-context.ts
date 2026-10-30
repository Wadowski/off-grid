// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SettingExecutor } from "./types.js";
import { uuid } from "./uuid.js";

export const withFamilyContext = async (tx: SettingExecutor, familyId: string): Promise<void> => {
  await tx.$executeRawUnsafe("SELECT set_config('app.family_id', $1, true)", uuid.parse(familyId));
};
