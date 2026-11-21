// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type FilterChipProps = {
  readonly label: ReactNode;
  readonly selected: boolean;
  readonly onToggle: () => void;
  readonly dotColor?: string;
  readonly count?: number;
  readonly "data-testid"?: string;
};
