// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { driveIdSchema } from "@offgrid/contracts";
import type { Drive } from "../../files/types.js";

export const toActiveDriveId = (
  routeDriveId: string | undefined,
  drives: readonly Drive[],
): Drive["id"] | null => {
  if (routeDriveId !== undefined) {
    return driveIdSchema.safeParse(routeDriveId).data ?? null;
  }
  return drives.find((drive) => drive.familyId === null)?.id ?? null;
};
