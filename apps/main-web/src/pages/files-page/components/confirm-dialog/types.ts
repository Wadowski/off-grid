// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FilesErrorTextId } from "../../../../files/types.js";
import type { ParseKeys } from "i18next";

export type ConfirmDialogTextId = ParseKeys;

export type ConfirmDialogProps = {
  readonly testIdPrefix: string;
  readonly titleTextId: ConfirmDialogTextId;
  readonly bodyTextId: ConfirmDialogTextId;
  readonly bodyValues: Readonly<Record<string, string | number>>;
  readonly cancelTextId: ConfirmDialogTextId;
  readonly confirmTextId: ConfirmDialogTextId;
  readonly narrow: boolean;
  readonly pending: boolean;
  readonly errorTextId: FilesErrorTextId | null;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};
