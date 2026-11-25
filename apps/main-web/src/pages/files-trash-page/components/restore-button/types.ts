// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type RestoreButtonProps = {
  readonly name: string;
  readonly entryId: string;
  readonly disabled: boolean;
  readonly compact: boolean;
  readonly onRestore: () => void;
};
