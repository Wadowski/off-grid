// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../files/types.js";
import type { FileSelection } from "./types.js";

export const toSelectedFileId = (
  selection: FileSelection | null,
  pathname: string,
  narrow: boolean,
): FileListItem["id"] | null =>
  selection !== null && !narrow && selection.pathname === pathname ? selection.fileId : null;
