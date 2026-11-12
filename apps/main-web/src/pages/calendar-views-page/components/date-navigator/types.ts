// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type DateNavigatorProps = {
  readonly label: string;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly onToday: () => void;
};
