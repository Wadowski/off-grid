// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import {
  findSiblingByName,
  type SiblingNameQuery,
} from "../../infrastructure/files/find-sibling-by-name.js";
import { NameTakenError } from "../errors/name-taken-error.js";

export const assertNameFree = async (
  tx: ModuleTransaction,
  query: SiblingNameQuery,
): Promise<void> => {
  const sibling = await findSiblingByName(tx, query);
  if (sibling !== null) {
    throw new NameTakenError();
  }
};
