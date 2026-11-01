// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const countUsers = async (tx: ModuleTransaction): Promise<number> => {
  const [row] = await tx.$queryRaw<{ count: number }[]>`SELECT identity.user_count()::int AS count`;
  return row?.count ?? 0;
};
