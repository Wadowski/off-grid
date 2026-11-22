// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileRecord, RecordFileVersionInput, RegularFileOutcome } from "../../types.js";
import { DEFAULT_MIME_TYPE } from "../../constants.js";
import { writeAsUser } from "../write-as-user.js";
import { appendFileVersion } from "./append-file-version.js";
import { resolveRegularFile } from "./resolve-regular-file.js";

export const recordFileVersion = (
  db: ModuleDatabase,
  input: RecordFileVersionInput,
): Promise<RegularFileOutcome<FileRecord>> =>
  writeAsUser(db, input.userId, async (tx) => {
    const target = await resolveRegularFile(tx, input.fileId);
    if (target.outcome !== "found") {
      return target;
    }
    return appendFileVersion(tx, {
      target: target.value,
      createdByUserId: input.userId,
      content: {
        storageKey: input.stored.key,
        sizeBytes: BigInt(input.stored.sizeBytes),
        mimeType: input.declaredMimeType ?? target.value.file.mimeType ?? DEFAULT_MIME_TYPE,
        sha256: input.stored.sha256,
      },
    });
  });
