// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "../../../../../../files/types.js";

export type DriveSwitcherGroupProps = {
  readonly captionTextId: "files.drives.personal" | "files.drives.family";
  readonly drives: readonly Drive[];
  readonly activeDriveId: Drive["id"] | null;
  readonly emptyTextId?: "files.drives.emptyFamily";
};
