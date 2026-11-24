// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import { listFamilyMembers } from "../families/list-family-members.js";
import type { ListStatus } from "../types.js";
import type { FamilyMemberEntry, FamilyMembersState } from "./types.js";

export const useFamilyMembers = (familyId: string | null): FamilyMembersState => {
  const [members, setMembers] = useState<readonly FamilyMemberEntry[]>([]);
  const [status, setStatus] = useState<ListStatus>("loading");
  const latestRequest = useRef(0);

  const refresh = useCallback(async () => {
    if (familyId === null) {
      return;
    }
    const request = ++latestRequest.current;
    const isLatest = () => request === latestRequest.current;
    setStatus("loading");
    try {
      const list = await listFamilyMembers(familyId);
      if (isLatest()) {
        setMembers(list);
        setStatus("ready");
      }
    } catch {
      if (isLatest()) {
        setStatus("failed");
      }
    }
  }, [familyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (familyId === null) {
    return { members: [], status: "ready", refresh };
  }
  return { members, status, refresh };
};
