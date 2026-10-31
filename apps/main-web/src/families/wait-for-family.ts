// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { listFamilies } from "./list-families.js";
import type { WaitForFamilyResult } from "./types.js";

export const waitForFamily = async (
  familyId: string,
  attempts: number,
  intervalMs: number,
): Promise<WaitForFamilyResult> => {
  let families = await listFamilies();
  for (let attempt = 1; attempt < attempts && !families.some((f) => f.id === familyId); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    families = await listFamilies();
  }
  return { families, found: families.some((f) => f.id === familyId) };
};
