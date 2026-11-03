// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import { FIRST_ADMIN_CLAIM_KEY } from "../../constants.js";

export const claimFirstAdmin = async (tx: ModuleTransaction): Promise<void> => {
  await tx.firstAdminClaim.create({ data: { claimKey: FIRST_ADMIN_CLAIM_KEY } });
};
