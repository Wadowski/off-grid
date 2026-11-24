// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type DeleteVersionConfirmProps = {
  readonly versionNumber: number;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
};
