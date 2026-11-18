// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import type { ReadSecretFile } from "../types.js";

export const readSecretFileUtf8: ReadSecretFile = (path) => readFileSync(path, "utf8");
