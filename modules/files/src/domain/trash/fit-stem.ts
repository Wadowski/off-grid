// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MAX_FILE_NAME_LENGTH } from "../../constants.js";

export const fitStem = (stem: string, suffix: string, extension: string): string =>
  stem.slice(0, Math.max(0, MAX_FILE_NAME_LENGTH - suffix.length - extension.length));
