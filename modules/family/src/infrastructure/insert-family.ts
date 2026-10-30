// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "@offgrid/db";
import type { Family, NewFamily } from "../types.js";
import { toFamily } from "./to-family.js";

export const insertFamily = async (tx: ModuleTransaction, family: NewFamily): Promise<Family> =>
  toFamily(await tx.family.create({ data: { familyId: family.id, name: family.name } }));
