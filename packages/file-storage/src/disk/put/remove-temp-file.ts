// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";

export const removeTempFile = async (tempPath: string): Promise<void> => {
  await rm(tempPath, { force: true }).catch(() => undefined);
};
