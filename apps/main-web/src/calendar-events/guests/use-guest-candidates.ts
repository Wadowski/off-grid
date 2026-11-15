// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { listFamilies } from "../../families/list-families.js";
import { listFamilyMembers } from "../../families/list-family-members.js";
import type { GuestCandidate, GuestCandidatesState, LoadStatus } from "./types.js";

const candidatesOfFamilies = async (selfUserId: string): Promise<readonly GuestCandidate[]> => {
  const families = await listFamilies();
  const groups = await Promise.all(
    families.map(async (family) => {
      const members = await listFamilyMembers(family.id);
      return members
        .filter((member) => member.userId !== selfUserId)
        .map((member) => ({
          userId: member.userId,
          name: member.displayName ?? undefined,
          familyName: family.name,
        }));
    }),
  );
  return groups.flat();
};

export const useGuestCandidates = (selfUserId: string): GuestCandidatesState => {
  const [candidates, setCandidates] = useState<readonly GuestCandidate[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setStatus("loading");
    candidatesOfFamilies(selfUserId)
      .then((list) => {
        if (current) {
          setCandidates(list);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (current) {
          setStatus("failed");
        }
      });
    return () => {
      current = false;
    };
  }, [selfUserId, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { status, candidates, retry };
};
