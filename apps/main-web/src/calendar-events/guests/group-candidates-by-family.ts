// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { GuestCandidate, GuestCandidateGroup } from "./types.js";

export const groupCandidatesByFamily = (
  candidates: readonly GuestCandidate[],
): readonly GuestCandidateGroup[] => {
  const families = new Map<string, GuestCandidate[]>();
  for (const candidate of candidates) {
    const group = families.get(candidate.familyName) ?? [];
    group.push(candidate);
    families.set(candidate.familyName, group);
  }
  return [...families].map(([familyName, members]) => ({ familyName, candidates: members }));
};
