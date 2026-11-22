// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "../../files/types.js";

export const toActiveDriveId = (
  routeDriveId: Drive["id"] | undefined,
  drives: readonly Drive[],
): Drive["id"] | null => {
  if (routeDriveId !== undefined) {
    return routeDriveId;
  }
  return drives.find((drive) => drive.familyId === null)?.id ?? null;
};
