// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadSecretFile } from "./types.js";
import { ConfigError } from "./config-error.js";

export const readRequiredSecret = (
  variableName: string,
  secretPath: string,
  readSecretFile: ReadSecretFile,
): string => {
  let contents: string;
  try {
    contents = readSecretFile(secretPath).trim();
  } catch {
    throw new ConfigError(`secret file named by ${variableName} cannot be read`);
  }
  if (contents.length === 0) {
    throw new ConfigError(`secret file named by ${variableName} is empty`);
  }
  return contents;
};
