// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { GuestCandidatesState } from "../types.js";

export type FamilyMembersSectionProps = {
  readonly state: GuestCandidatesState;
  readonly familyId: string;
};
