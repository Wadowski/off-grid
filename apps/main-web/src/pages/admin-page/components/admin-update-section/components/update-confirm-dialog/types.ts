// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type UpdateConfirmDialogProps = {
  readonly version: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};
