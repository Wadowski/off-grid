// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileEventInput } from "../../types.js";

export const toFileEventPayload = ({ file, owner }: FileEventInput) => ({
  fileId: file.fileId,
  driveId: file.driveId,
  ownerUserId: owner.userId,
  ownerFamilyId: owner.familyId,
  parentId: file.parentId,
  isFolder: file.isFolder,
  name: file.name,
  size: file.sizeBytes === null ? null : Number(file.sizeBytes),
  currentVersionId: file.currentVersionId,
  deletedAt: file.deletedAt === null ? null : file.deletedAt.toISOString(),
  version: file.version,
});
