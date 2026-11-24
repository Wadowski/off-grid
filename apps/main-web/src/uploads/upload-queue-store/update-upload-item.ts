// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadItem } from "../types.js";

export const updateUploadItem = (
  items: readonly UploadItem[],
  id: string,
  patch: Partial<UploadItem>,
): readonly UploadItem[] => items.map((item) => (item.id === id ? { ...item, ...patch } : item));
