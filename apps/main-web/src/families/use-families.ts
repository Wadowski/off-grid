// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { FAMILY_LIST_POLL_ATTEMPTS, FAMILY_LIST_POLL_INTERVAL_MS } from "../constants.js";
import type { CreateFamilyStatus, FamilySummary, ListStatus } from "../types.js";
import { createFamily } from "./create-family.js";
import { listFamilies } from "./list-families.js";
import { waitForFamily } from "./wait-for-family.js";

export const useFamilies = () => {
  const [families, setFamilies] = useState<readonly FamilySummary[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [createStatus, setCreateStatus] = useState<CreateFamilyStatus>("idle");

  const loadFamilies = useCallback(async () => {
    setListStatus("loading");
    try {
      setFamilies(await listFamilies());
      setListStatus("ready");
    } catch {
      setListStatus("failed");
    }
  }, []);

  useEffect(() => {
    void loadFamilies();
  }, [loadFamilies]);

  const submitFamily = async (name: string): Promise<boolean> => {
    setCreateStatus("submitting");
    try {
      const family = await createFamily(name);
      setCreateStatus("waiting-for-list");
      const result = await waitForFamily(
        family.id,
        FAMILY_LIST_POLL_ATTEMPTS,
        FAMILY_LIST_POLL_INTERVAL_MS,
      );
      setFamilies(result.families);
      setListStatus("ready");
      setCreateStatus(result.found ? "done" : "waiting-for-list");
      return true;
    } catch {
      setCreateStatus("failed");
      return false;
    }
  };

  return { families, listStatus, createStatus, submitFamily };
};
