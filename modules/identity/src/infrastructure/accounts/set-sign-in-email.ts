// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const setSignInEmail = async (tx: ModuleTransaction, email: string): Promise<void> => {
  await tx.$executeRawUnsafe("SELECT set_config('app.sign_in_email', $1, true)", email);
};
