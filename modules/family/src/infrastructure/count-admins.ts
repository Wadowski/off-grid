// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const countAdmins = (tx: ModuleTransaction, familyId: string): Promise<number> =>
  tx.familyMember.count({ where: { familyId, role: "admin" } });
