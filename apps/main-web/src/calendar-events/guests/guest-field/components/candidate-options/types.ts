// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { GuestCandidate } from "../../../types.js";

export type CandidateOptionsProps = {
  readonly candidates: readonly GuestCandidate[];
  readonly selectedIds: readonly string[];
  readonly onToggle: (userId: string) => void;
};
