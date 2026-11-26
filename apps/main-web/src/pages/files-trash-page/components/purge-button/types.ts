// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type PurgeButtonProps = {
  readonly name: string;
  readonly disabled: boolean;
  readonly compact: boolean;
  readonly onPurge: () => void;
};
