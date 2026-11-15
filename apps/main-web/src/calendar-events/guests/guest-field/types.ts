// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { GuestCandidatesState } from "../types.js";

export type GuestFieldProps = {
  readonly selectedIds: readonly string[];
  readonly candidatesState: GuestCandidatesState;
  readonly disabled: boolean;
  readonly onToggle: (userId: string) => void;
};
