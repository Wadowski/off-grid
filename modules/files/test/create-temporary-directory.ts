// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const createTemporaryDirectory = (): Promise<string> =>
  mkdtemp(join(tmpdir(), "offgrid-files-"));
