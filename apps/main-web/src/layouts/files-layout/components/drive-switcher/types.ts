// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../types.js";
import type { Drive, FilesErrorTextId } from "../../../../files/types.js";

export type DriveSwitcherProps = {
  readonly drives: readonly Drive[];
  readonly status: ListStatus;
  readonly errorTextId: FilesErrorTextId | null;
  readonly activeDriveId: Drive["id"] | null;
  readonly onRetry: () => void;
};
