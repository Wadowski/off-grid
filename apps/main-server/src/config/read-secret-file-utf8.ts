// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadSecretFile } from "../types.js";
import { readFileSync } from "node:fs";

export const readSecretFileUtf8: ReadSecretFile = (path) => readFileSync(path, "utf8");
