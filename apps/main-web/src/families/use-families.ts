// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import type { CreateFamilyStatus, FamilySummary, ListStatus } from "../types.js";
import { createFamily } from "./create-family.js";
import { listFamilies } from "./list-families.js";

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
      await createFamily(name);
      setCreateStatus("idle");
    } catch {
      setCreateStatus("failed");
      return false;
    }
    await loadFamilies();
    return true;
  };

  return { families, listStatus, createStatus, submitFamily };
};
