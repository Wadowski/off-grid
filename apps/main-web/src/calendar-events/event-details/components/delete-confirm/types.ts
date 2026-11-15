// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type DeleteConfirmProps = {
  readonly narrow: boolean;
  readonly deleting: boolean;
  readonly failed: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};
