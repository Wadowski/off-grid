// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { NewSession } from "../types.js";

export const insertSession = async (tx: ModuleTransaction, session: NewSession): Promise<void> => {
  await tx.session.create({
    data: {
      sessionId: session.id,
      userId: session.userId,
      deviceLabel: session.deviceLabel,
      expiresAt: session.expiresAt,
      refreshTokenHash: session.refreshTokenHash,
    },
  });
};
