// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export const createStorageRoot = async (base: string): Promise<string> => {
  const root = join(base, "files");
  await mkdir(root);
  return root;
};
