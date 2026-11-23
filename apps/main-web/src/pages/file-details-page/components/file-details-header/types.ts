// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FileDetailsBackTarget = {
  readonly to: string;
  readonly name: string;
};

export type FileDetailsHeaderProps = {
  readonly backTarget: FileDetailsBackTarget | null;
};
