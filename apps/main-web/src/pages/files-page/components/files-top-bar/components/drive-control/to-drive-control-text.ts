// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../../../types.js";
import type { DriveControlText } from "./types.js";

export const toDriveControlText = (
  status: ListStatus,
  activeDriveName: string | null,
): DriveControlText => {
  if (status === "loading") {
    return { kind: "text", textId: "files.topBar.driveLoading" };
  }
  if (activeDriveName === null) {
    return { kind: "text", textId: "files.topBar.driveUnknown" };
  }
  return { kind: "name", name: activeDriveName };
};
