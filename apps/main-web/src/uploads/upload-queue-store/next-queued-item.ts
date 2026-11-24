// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem } from "../types.js";

export const nextQueuedItem = (items: readonly UploadItem[]): UploadItem | undefined =>
  items.find((item) => item.status === "queued" && item.file !== null);
