// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileRemovedV1 } from "@offgrid/contracts";
import { rawSqlExecutor, type ModuleTransaction } from "@offgrid/db";
import { publishOwnedEvent } from "@offgrid/event-bus";
import type { FileEventInput } from "../../types.js";
import { toFileRemovedPayload } from "./to-file-removed-payload.js";

export const publishFileRemoved = (tx: ModuleTransaction, input: FileEventInput): Promise<number> =>
  publishOwnedEvent(
    rawSqlExecutor(tx),
    fileRemovedV1,
    {
      userId: input.owner.userId,
      familyId: input.owner.familyId,
      sourceVersion: input.file.version + 1,
    },
    toFileRemovedPayload(input),
  );
