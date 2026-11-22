// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NotificationsSurface } from "./types.js";

export const surfaceForViewport = (isNarrow: boolean): NotificationsSurface =>
  isNarrow ? "modal" : "popover";
