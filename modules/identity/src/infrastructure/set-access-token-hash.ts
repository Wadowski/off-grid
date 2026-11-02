// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const setAccessTokenHash = async (
  tx: ModuleTransaction,
  accessTokenHash: string,
): Promise<void> => {
  await tx.$executeRawUnsafe(
    "SELECT set_config('app.access_token_hash', $1, true)",
    accessTokenHash,
  );
};
