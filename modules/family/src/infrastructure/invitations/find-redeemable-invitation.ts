// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";

export const findRedeemableInvitation = (
  tx: ModuleTransaction,
  codeHash: string,
): Promise<{ readonly familyId: string } | null> =>
  tx.familyInvitation.findFirst({
    where: { codeHash },
    select: { familyId: true },
  });
