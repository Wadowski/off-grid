// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RefObject } from "react";
import type { NotificationItem } from "../../../../../../notifications/index.js";

export type NotificationsSurfaceControls = {
  readonly dialogRef: RefObject<HTMLDialogElement | null>;
  readonly openFromSurface: (notice: NotificationItem) => Promise<void>;
  readonly viewAll: () => void;
};
