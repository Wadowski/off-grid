// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive } from "./types.js";

export const toTrashPath = (driveId: Drive["id"]): string =>
  `/files/${encodeURIComponent(driveId)}/trash`;
