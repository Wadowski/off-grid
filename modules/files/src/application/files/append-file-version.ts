// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ModuleTransaction } from "@offgrid/db";
import { publishFileUpdated } from "../../events/files/publish-file-updated.js";
import { findNextVersionNumber } from "../../infrastructure/files/find-next-version-number.js";
import { insertFileVersion } from "../../infrastructure/files/insert-file-version.js";
import { lockFileRow } from "../../infrastructure/files/lock-file-row.js";
import { updateFile } from "../../infrastructure/files/update-file.js";
import type { AppendFileVersionInput, FileRecord, RegularFileOutcome } from "../../types.js";

export const appendFileVersion = async (
  tx: ModuleTransaction,
  input: AppendFileVersionInput,
): Promise<RegularFileOutcome<FileRecord>> => {
  const { file, owner } = input.target;
  if (!(await lockFileRow(tx, file.fileId))) {
    return { outcome: "not-found" };
  }
  const versionId = randomUUID();
  await insertFileVersion(tx, {
    versionId,
    fileId: file.fileId,
    owner,
    number: await findNextVersionNumber(tx, file.fileId),
    storageKey: input.content.storageKey,
    sizeBytes: input.content.sizeBytes,
    mimeType: input.content.mimeType,
    sha256: input.content.sha256,
    createdByUserId: input.createdByUserId,
  });
  const updated = await updateFile(tx, file.fileId, {
    sizeBytes: input.content.sizeBytes,
    mimeType: input.content.mimeType,
    currentVersionId: versionId,
    updatedAt: new Date(),
  });
  await publishFileUpdated(tx, { file: updated, owner });
  return { outcome: "found", value: updated };
};
