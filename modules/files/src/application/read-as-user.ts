// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";

export const readAsUser = <Value>(
  db: ModuleDatabase,
  userId: string,
  read: (tx: ModuleTransaction) => Promise<Value>,
): Promise<Value> =>
  db.$transaction(async (tx) => {
    await withUserContext(tx, userId);
    return read(tx);
  });
