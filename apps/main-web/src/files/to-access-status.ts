// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../types.js";
import type { Drive } from "./types.js";

export const toAccessStatus = (
  drive: Drive | null,
  drivesStatus: ListStatus,
  membersStatus: ListStatus,
): ListStatus => {
  if (drive !== null) {
    return membersStatus;
  }
  return drivesStatus === "ready" ? "failed" : drivesStatus;
};
