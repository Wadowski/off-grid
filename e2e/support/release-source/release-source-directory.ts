// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";
import { RELEASE_SOURCE_FOLDER } from "./constants.js";

export const releaseSourceDirectory = (): string =>
  fileURLToPath(new URL(RELEASE_SOURCE_FOLDER, import.meta.url));
