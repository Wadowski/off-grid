// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReadSecretFile, UpdaterSettings } from "../types.js";
import { ConfigError } from "./config-error.js";
import { readRequiredSecret } from "./read-required-secret.js";

export const readUpdaterSettings = (
  url: string | undefined,
  tokenFile: string | undefined,
  readSecretFile: ReadSecretFile,
): UpdaterSettings | null => {
  if (url === undefined && tokenFile === undefined) {
    return null;
  }
  if (url === undefined) {
    throw new ConfigError("OFFGRID_UPDATER_URL is required when OFFGRID_UPDATER_TOKEN_FILE is set");
  }
  if (tokenFile === undefined) {
    throw new ConfigError("OFFGRID_UPDATER_TOKEN_FILE is required when OFFGRID_UPDATER_URL is set");
  }
  return {
    url,
    token: readRequiredSecret("OFFGRID_UPDATER_TOKEN_FILE", tokenFile, readSecretFile),
  };
};
