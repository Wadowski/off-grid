// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useRef, useState } from "react";
import type { CreateFamilyStatus, FamilyAppearance, FamilySpace, ListStatus } from "../types.js";
import { createFamily } from "./create-family.js";
import { listFamilies } from "./list-families.js";

export const useFamilies = () => {
  const [families, setFamilies] = useState<readonly FamilySpace[]>([]);
  const [listStatus, setListStatus] = useState<ListStatus>("loading");
  const [createStatus, setCreateStatus] = useState<CreateFamilyStatus>("idle");
  const latestListRequest = useRef(0);

  const loadFamilies = useCallback(async () => {
    const request = ++latestListRequest.current;
    const isLatest = () => request === latestListRequest.current;
    setListStatus("loading");
    try {
      const list = await listFamilies();
      if (isLatest()) {
        setFamilies(list);
        setListStatus("ready");
      }
    } catch {
      if (isLatest()) {
        setListStatus("failed");
      }
    }
  }, []);

  useEffect(() => {
    void loadFamilies();
  }, [loadFamilies]);

  const submitFamily = async (name: string, appearance?: FamilyAppearance): Promise<boolean> => {
    setCreateStatus("submitting");
    try {
      await createFamily(name, appearance);
      setCreateStatus("idle");
    } catch {
      setCreateStatus("failed");
      return false;
    }
    await loadFamilies();
    return true;
  };

  return { families, listStatus, createStatus, submitFamily, refreshFamilies: loadFamilies };
};
