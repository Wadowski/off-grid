// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListPage, FolderContentsSnapshot } from "./types.js";

export const toReadySnapshot = (page: FileListPage): FolderContentsSnapshot => ({
  items: page.items,
  nextCursor: page.nextCursor,
  status: "ready",
  errorTextId: null,
  isLoadingMore: false,
});
