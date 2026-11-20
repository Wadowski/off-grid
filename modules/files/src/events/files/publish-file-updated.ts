// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileUpdatedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";
import type { FileEventInput } from "../../types.js";
import { toFileEventPayload } from "./to-file-event-payload.js";

export const publishFileUpdated = (tx: ModuleTransaction, input: FileEventInput): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    fileUpdatedV1,
    {
      userId: input.owner.userId,
      familyId: input.owner.familyId,
      sourceVersion: input.file.version,
    },
    toFileEventPayload(input),
  );
