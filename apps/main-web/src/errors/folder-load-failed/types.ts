// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorTextId } from "../../files/types.js";

export type FolderLoadFailedProps = {
  readonly errorTextId: FilesErrorTextId;
  readonly onRetry: () => void;
};
