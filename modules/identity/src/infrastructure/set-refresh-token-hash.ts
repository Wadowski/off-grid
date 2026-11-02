// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const setRefreshTokenHash = async (
  tx: ModuleTransaction,
  refreshTokenHash: string,
): Promise<void> => {
  await tx.$executeRawUnsafe(
    "SELECT set_config('app.refresh_token_hash', $1, true)",
    refreshTokenHash,
  );
};
