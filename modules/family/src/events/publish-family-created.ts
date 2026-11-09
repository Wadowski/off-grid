// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { familyCreatedV1 } from "@offgrid/contracts";
import type { ModuleTransaction } from "@offgrid/db";
import { publishFamilyEvent } from "./publish-family-event.js";
import type { FamilyCreatedInput } from "../types.js";

export const publishFamilyCreated = (
  tx: ModuleTransaction,
  input: FamilyCreatedInput,
): Promise<number> => publishFamilyEvent(tx, familyCreatedV1, input.familyId, { name: input.name });
