// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorTextId } from "../../../../files/types.js";

export type DeleteEntryDialogProps = {
  readonly name: string;
  readonly isFolder: boolean;
  readonly narrow: boolean;
  readonly pending: boolean;
  readonly errorTextId: FilesErrorTextId | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};
