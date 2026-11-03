// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const countActiveAdmins = async (tx: ModuleTransaction): Promise<number> => {
  const rows = await tx.$queryRaw<
    { count: bigint }[]
  >`SELECT identity.active_admin_count() AS count`;
  return Number(rows[0]?.count ?? 0);
};
