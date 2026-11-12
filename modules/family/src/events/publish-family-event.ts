// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AnyEventDefinition } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";

export const publishFamilyEvent = (
  tx: ModuleTransaction,
  definition: AnyEventDefinition,
  familyId: string,
  payload: unknown,
  sourceVersion?: number,
): Promise<number> =>
  publishOwnedEvent(rawSqlExecutor(tx), definition, { familyId, sourceVersion }, payload);
