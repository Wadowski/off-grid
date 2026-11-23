// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileEventInput } from "../../types.js";

export const toFileRemovedPayload = ({ file, owner }: FileEventInput) => ({
  fileId: file.fileId,
  driveId: file.driveId,
  ownerUserId: owner.userId,
  ownerFamilyId: owner.familyId,
  version: file.version + 1,
});
