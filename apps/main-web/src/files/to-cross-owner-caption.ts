// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toIsCrossOwnerTarget } from "./to-is-cross-owner-target.js";
import type { Drive, FolderPickerCaption } from "./types.js";

export const toCrossOwnerCaption = (
  drives: readonly Drive[],
  sourceDriveId: Drive["id"],
  targetDriveId: Drive["id"],
): FolderPickerCaption | null =>
  toIsCrossOwnerTarget(drives, sourceDriveId, targetDriveId) ? "otherOwner" : null;
