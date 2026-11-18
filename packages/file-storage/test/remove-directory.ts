// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { rm } from "node:fs/promises";

export const removeDirectory = (directory: string): Promise<void> =>
  rm(directory, { recursive: true, force: true });
