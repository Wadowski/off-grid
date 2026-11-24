// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UploadErrorTextId, UploadItem } from "../types.js";
import { isActiveUploadItem } from "./is-active-upload-item.js";

export const failUnfinishedItems = (
  items: readonly UploadItem[],
  errorTextId: UploadErrorTextId,
): readonly UploadItem[] =>
  items.map((item) =>
    isActiveUploadItem(item)
      ? { ...item, status: "failed", errorTextId, file: null }
      : item,
  );
