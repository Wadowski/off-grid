// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type UploadQueueRowActionsProps = {
  readonly name: string;
  readonly testIdPrefix: string;
  readonly canRetry: boolean;
  readonly onRetry: () => void;
  readonly onDismiss: () => void;
};
