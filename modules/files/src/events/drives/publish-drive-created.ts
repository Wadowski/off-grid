// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveCreatedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";
import type { DriveCreatedInput } from "../../types.js";

export const publishDriveCreated = (
  tx: ModuleTransaction,
  input: DriveCreatedInput,
): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    driveCreatedV1,
    { userId: input.ownerUserId, familyId: input.ownerFamilyId },
    {
      driveId: input.driveId,
      ownerUserId: input.ownerUserId,
      ownerFamilyId: input.ownerFamilyId,
    },
  );
