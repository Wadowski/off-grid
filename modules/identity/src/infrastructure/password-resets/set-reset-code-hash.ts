// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const setResetCodeHash = async (tx: ModuleTransaction, codeHash: string): Promise<void> => {
  await tx.$executeRawUnsafe("SELECT set_config('app.reset_code_hash', $1, true)", codeHash);
};
