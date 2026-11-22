// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "../../../../files/types.js";

export const splitDrivesByKind = (drives: readonly Drive[]) => ({
  personal: drives.filter((drive) => drive.familyId === null),
  family: drives.filter((drive) => drive.familyId !== null),
});
