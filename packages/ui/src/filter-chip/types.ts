// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FilterChipProps = {
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
  readonly dotColor?: string;
  readonly "data-testid"?: string;
};
