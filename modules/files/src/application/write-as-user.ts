// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { withUserContext, type ModuleDatabase, type ModuleTransaction } from "@offgrid/db";
import { NameTakenError } from "./errors/name-taken-error.js";
import { isNameConflict } from "../infrastructure/files/is-name-conflict.js";

export const writeAsUser = <Value>(
  db: ModuleDatabase,
  userId: string,
  write: (tx: ModuleTransaction) => Promise<Value>,
): Promise<Value> =>
  db
    .$transaction(async (tx) => {
      await withUserContext(tx, userId);
      return write(tx);
    })
    .catch((error: unknown) => {
      throw isNameConflict(error) ? new NameTakenError() : error;
    });
