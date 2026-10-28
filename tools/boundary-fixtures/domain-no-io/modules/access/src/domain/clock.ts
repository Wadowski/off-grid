// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";

// Deliberate violation: domain code performs file I/O.
export const readClock = (path: string): string => readFileSync(path, "utf8");
