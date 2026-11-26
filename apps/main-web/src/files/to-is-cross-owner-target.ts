// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "./types.js";

export const toIsCrossOwnerTarget = (
  drives: readonly Drive[],
  sourceDriveId: Drive["id"],
  targetDriveId: Drive["id"],
): boolean => {
  const sourceDrive = drives.find((drive) => drive.id === sourceDriveId);
  const targetDrive = drives.find((drive) => drive.id === targetDriveId);
  if (sourceDrive === undefined || targetDrive === undefined) {
    return false;
  }
  return sourceDrive.familyId !== targetDrive.familyId;
};
