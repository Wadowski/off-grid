// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { listFamilyMembers } from "../../families/family-members.js";
import type { FamilyMemberView, RosterStatus } from "./types.js";

export const useFamilyMembers = (familyId: string | undefined) => {
  const [members, setMembers] = useState<readonly FamilyMemberView[]>([]);
  const [status, setStatus] = useState<RosterStatus>("loading");

  const load = useCallback(async (id: string) => {
    setStatus("loading");
    try {
      setMembers(await listFamilyMembers(id));
      setStatus("ready");
    } catch {
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    if (familyId !== undefined) {
      void load(familyId);
    }
  }, [familyId, load]);

  return { members, status, reload: () => familyId !== undefined && load(familyId) };
};
