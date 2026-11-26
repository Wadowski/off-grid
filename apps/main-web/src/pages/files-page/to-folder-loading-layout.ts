// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesView } from "../../files/types.js";
import type { FolderLoadingLayout } from "./components/folder-loading/types.js";

export const toFolderLoadingLayout = (phone: boolean, view: FilesView): FolderLoadingLayout => {
  if (phone) {
    return "phone";
  }
  return view === "grid" ? "grid" : "table";
};
