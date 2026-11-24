// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem } from "../types.js";

export const removeFinishedItems = (items: readonly UploadItem[]): readonly UploadItem[] =>
  items.filter((item) => item.status === "queued" || item.status === "uploading");
